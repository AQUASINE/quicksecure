import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDb = new DynamoDBClient({ region: "us-east-2" });
const docClient = DynamoDBDocumentClient.from(dynamoDb);
const ORGANIZATIONS_TABLE = "organizations";

export const handler = async (event) => {
    try {
        let httpMethod = event.httpMethod || event.requestContext?.http?.method;
        const body = event.body ? JSON.parse(event.body) : null;
        let response;
        let headers = {
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        };

        switch (httpMethod) {
            case "POST":
                response = await createOrganization(body);
                break;
            case "GET":
                response = await getOrganizations();
                break;
            case "PUT":
                response = await updateOrganization(body);
                break;
            case "DELETE":
                response = await deleteOrganization(body.orgId);
                break;
            case "OPTIONS":
                response = { statusCode: 200, body: "OK" };
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

const createOrganization = async (body) => {
    if (!body || !body.orgId || !body.owner || !body.orgName) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields (orgId, owner, orgName)" }) };
    }

    const putCommand = new PutCommand({
        TableName: ORGANIZATIONS_TABLE,
        Item: {
            orgId: body.orgId,
            owner: body.owner,
            orgName: body.orgName,
        },
    });

    await docClient.send(putCommand);
    return { statusCode: 201, body: JSON.stringify({ message: "Organization created successfully" }) };
};

const getOrganizations = async () => {
    const scanCommand = new ScanCommand({ TableName: ORGANIZATIONS_TABLE });
    const result = await docClient.send(scanCommand);

    return { statusCode: 200, body: JSON.stringify(result.Items) };
};

const updateOrganization = async (body) => {
    if (!body.orgId) {
        return { statusCode: 400, body: JSON.stringify({ error: "orgId is required" }) };
    }

    const updateExpressions = [];
    const expressionAttributeValues = {};

    if (body.owner) {
        updateExpressions.push("owner = :owner");
        expressionAttributeValues[":owner"] = body.owner;
    }
    if (body.orgName) {
        updateExpressions.push("orgName = :orgName");
        expressionAttributeValues[":orgName"] = body.orgName;
    }

    if (updateExpressions.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: "No fields to update" }) };
    }

    const updateCommand = new UpdateCommand({
        TableName: ORGANIZATIONS_TABLE,
        Key: { orgId: body.orgId },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "UPDATED_NEW",
    });

    await docClient.send(updateCommand);
    return { statusCode: 200, body: JSON.stringify({ message: "Organization updated successfully" }) };
};

const deleteOrganization = async (orgId) => {
    if (!orgId) {
        return { statusCode: 400, body: JSON.stringify({ error: "orgId is required" }) };
    }

    const deleteCommand = new DeleteCommand({
        TableName: ORGANIZATIONS_TABLE,
        Key: { orgId },
    });

    await docClient.send(deleteCommand);
    return { statusCode: 200, body: JSON.stringify({ message: "Organization deleted successfully" }) };
};
