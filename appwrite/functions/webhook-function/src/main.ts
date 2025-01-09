import { Client, Users } from "node-appwrite";
import { Models } from "appwrite";
import * as crypto from "crypto";

interface WebhookRequestHeaders {
  accept: string;
  "accept-encoding": string;
  "content-length": string;
  "content-type": string;
  host: string;
  "user-agent": string;
  "x-appwrite-webhook-events": string;
  "x-appwrite-webhook-id": string;
  "x-appwrite-webhook-name": string;
  "x-appwrite-webhook-project-id": string;
  "x-appwrite-webhook-signature": string;
  "x-appwrite-webhook-user-id": string;
  "x-forwarded-for": string;
  "x-forwarded-host": string;
  "x-forwarded-proto": string;
  "x-appwrite-key": string;
  "x-appwrite-trigger": string;
  "x-appwrite-event": string;
  "x-appwrite-user-id": string;
  "x-appwrite-user-jwt": string;
}

interface WebhookRequestBody extends Models.User<Models.Preferences> {
  targets: Models.Target[],
  accessedAt: string;
}

export default async ({ req, res, log, error }: any) => {
  const client = new Client()
    .setEndpoint(Bun.env["APPWRITE_FUNCTION_API_ENDPOINT"])
    .setProject(Bun.env["APPWRITE_FUNCTION_PROJECT_ID"])
    .setKey(req.headers["x-appwrite-key"] ?? "");
  const users = new Users(client);

  const headers = req.headers as WebhookRequestHeaders;
  const data = req.bodyJson as WebhookRequestBody;

  const validateWebhook = (
    payload: string,
    signatureKey: string,
    webhookSignature: string,
    webhookUrl: string
  ): boolean => {
    const signature = crypto
      .createHmac("sha1", signatureKey)
      .update(`https://${webhookUrl}${payload}`)
      .digest()
      .toString("base64");
    return signature === webhookSignature;
  };

  if (validateWebhook(
    JSON.stringify(data),
    Bun.env['WEBHOOK_SIGNATURE_KEY'],
    headers['x-appwrite-webhook-signature'],
    headers.host
  )) {
    log('Webhook validated')
    return res.json({ message: 'Webhook validated! '})
  } else {
    error("Webhook NOT VALIDATED");
    return res.json({ message: "Webhook NOT VALIDATED"})
  }
};
