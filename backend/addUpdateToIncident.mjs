import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDb = new DynamoDBClient({ region: "us-east-2" });
const INCIDENT_TABLE = "incidents";

export const handler = async (event) => {
    try {
        let httpMethod = event.httpMethod || event.requestContext?.http?.method;
        let headers = {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, POST",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                };
        if (httpMethod === "OPTIONS") {
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({ message: "CORS preflight response" }),
            };
        }

        const body = event.body ? JSON.parse(event.body) : null;
        if (!body || !body.incidentId || !body.title || !body.content) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "incidentId, title, and content are required" })
            };
        }

        const currentTimestamp = Date.now();
        const newUpdate = {
            M: {
                title: { S: body.title },
                content: { S: body.content },
                createdTime: { N: (currentTimestamp / 1000).toString() },
                updatedTime: { N: (currentTimestamp / 1000).toString() },
            }
        };

        const updateCommand = new UpdateItemCommand({
            TableName: INCIDENT_TABLE,
            Key: { incidentId: { S: body.incidentId } },
            UpdateExpression: "SET updates = list_append(if_not_exists(updates, :emptyList), :newUpdate)",
            ExpressionAttributeValues: {
                ":newUpdate": { L: [newUpdate] },
                ":emptyList": { L: [] }
            },
            ReturnValues: "UPDATED_NEW",
        });

        await dynamoDb.send(updateCommand);
        return { headers: headers, statusCode: 200, body: JSON.stringify({ message: "Update added successfully" }) };
    } catch (error) {
        console.error("Error adding update:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
    }
};
