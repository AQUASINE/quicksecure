import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDb = new DynamoDBClient({ region: "us-east-2" });
const INCIDENT_TABLE = "incidents";

export const handler = async (event) => {
    try {
        const body = event.body ? JSON.parse(event.body) : null;
        if (!body || !body.incidentId || !body.action) {
            return { statusCode: 400, body: JSON.stringify({ error: "incidentId and action are required" }) };
        }

        if (body.action !== "open" && body.action !== "close") {
            return { statusCode: 400, body: JSON.stringify({ error: "action must be either 'open' or 'close'" }) };
        }

        let updateExpression;
        let expressionAttributeValues = {};

        if (body.action === "close") {
            // for closing, set endTime to provided value or current time
            const endTime = body.endTime ? Number(body.endTime) : Date.now();
            updateExpression = "SET endTime = :endTime";
            expressionAttributeValues[":endTime"] = { N: endTime.toString() };
        } else {
            // for opening, remove endTime from the item
            updateExpression = "REMOVE endTime";
        }

        const updateCommand = new UpdateItemCommand({
            TableName: INCIDENT_TABLE,
            Key: { incidentId: { S: body.incidentId } },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
            ReturnValues: "UPDATED_NEW",
        });

        await dynamoDb.send(updateCommand);
        const message = body.action === "close" ? "Incident closed successfully" : "Incident opened successfully";
        return { statusCode: 200, body: JSON.stringify({ message }) };
    } catch (error) {
        console.error("Error updating incident status:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
    }
};
