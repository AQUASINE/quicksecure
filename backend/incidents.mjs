import { DynamoDBClient, PutItemCommand, UpdateItemCommand, DeleteItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const dynamoDb = new DynamoDBClient({ region: "us-east-2" });
const sns = new SNSClient({ region: "us-east-2" });
const INCIDENT_TABLE = "incidents";
const SNS_TOPIC_ARN = "arn:aws:sns:us-east-2:605134442007:Incidents";

export const handler = async (event) => {
    try {
        let httpMethod = event.httpMethod;
        if (!httpMethod) {
            httpMethod = event.requestContext?.http?.method
        }

        let headers = {
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        };

        const body = event.body ? JSON.parse(event.body) : null;
        let response;

        switch (httpMethod) {
            case "POST":
                response = await createIncident(body);
                break;
            case "GET":
                response = await getIncidents();
                break;
            case "PUT":
                response = await updateIncident(body);
                break;
            case "DELETE":
                response = await deleteIncident(body.incidentId);
                break;
            case "OPTIONS":
                response = { statusCode: 200, body: JSON.stringify({ message: "CORS preflight request handled" }) };
                break;
            default:
                response = { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
        }
        response.headers = headers;
        return response;

    } catch (error) {
        console.error("Error handling request:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
    }
};

const createIncident = async (body) => {
    if (!body || !body.organization || !body.description || !body.startTime || body.severity === undefined || body.urgency === undefined) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    const incidentID = Date.now().toString();

    const putCommand = new PutItemCommand({
        TableName: INCIDENT_TABLE,
        Item: {
            incidentId: { S: incidentID },
            organization: { S: body.organization },
            description: { S: body.description },
            startTime: { N: body.startTime.toString() },
            endTime: body.endTime ? { N: body.endTime.toString() } : { NULL: true },
            severity: { N: body.severity.toString() },
            urgency: { N: body.urgency.toString() },
            updates: { L: [] }
        },
    });

    await dynamoDb.send(putCommand);

    // send SNS notification
    console.log("Sending SNS notification to topic " + SNS_TOPIC_ARN);
    const snsCommand = new PublishCommand({
        TopicArn: SNS_TOPIC_ARN,
        Message: `New Incident Reported: ${body.description}\nSeverity: ${body.severity}, Urgency: ${body.urgency}`,
        Subject: "Cybersecurity Incident Alert",
    });

    await sns.send(snsCommand);

    return { statusCode: 201, body: JSON.stringify({ incidentId: incidentID }) };
};

const getIncidents = async () => {
    const scanCommand = new ScanCommand({ TableName: INCIDENT_TABLE });
    const result = await dynamoDb.send(scanCommand);

    const incidents = result.Items.map(item => ({
        incidentId: item.incidentId.S,
        organization: item.organization.S,
        description: item.description.S,
        startTime: Number(item.startTime.N),
        endTime: item.endTime ? Number(item.endTime.N) : null,
        severity: Number(item.severity.N),
        urgency: Number(item.urgency.N),
        updates: item.updates.L.map(update => ({
            title: update.M.title.S,
            content: update.M.content.S,
            createdTime: Number(update.M.createdTime.N),
            updatedTime: Number(update.M.updatedTime.N)
        }))
    }));

    return { statusCode: 200, body: JSON.stringify(incidents) };
};

const updateIncident = async (body) => {
    if (!body.incidentId) {
        return { statusCode: 400, body: JSON.stringify({ error: "incidentId is required" }) };
    }

    const updateExpressions = [];
    const expressionAttributeValues = {};

    if (body.description) {
        updateExpressions.push("description = :description");
        expressionAttributeValues[":description"] = { S: body.description };
    }
    if (body.endTime) {
        updateExpressions.push("endTime = :endTime");
        expressionAttributeValues[":endTime"] = { N: body.endTime.toString() };
    }
    if (body.severity !== undefined) {
        updateExpressions.push("severity = :severity");
        expressionAttributeValues[":severity"] = { N: body.severity.toString() };
    }
    if (body.urgency !== undefined) {
        updateExpressions.push("urgency = :urgency");
        expressionAttributeValues[":urgency"] = { N: body.urgency.toString() };
    }

    if (updateExpressions.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: "No fields to update" }) };
    }

    const updateCommand = new UpdateItemCommand({
        TableName: INCIDENT_TABLE,
        Key: { incidentId: { S: body.incidentId } },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "UPDATED_NEW",
    });

    await dynamoDb.send(updateCommand);
    return { statusCode: 200, body: JSON.stringify({ message: "Incident updated successfully" }) };
};

const deleteIncident = async (incidentId) => {
    if (!incidentId) {
        return { statusCode: 400, body: JSON.stringify({ error: "incidentId is required" }) };
    }

    const deleteCommand = new DeleteItemCommand({
        TableName: INCIDENT_TABLE,
        Key: { incidentId: { S: incidentId } },
    });

    await dynamoDb.send(deleteCommand);
    return { statusCode: 200, body: JSON.stringify({ message: "Incident deleted successfully" }) };
};
