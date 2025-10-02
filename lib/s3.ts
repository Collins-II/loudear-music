import AWS from "aws-sdk";
const s3 = new AWS.S3({
accessKeyId: process.env.AWS_ACCESS_KEY_ID,
secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
region: process.lib/s3.ts (uses AWS S3)
env.AWS_REGION,
});
export async function uploadToS3(key: string, buffer: Buffer, contentType: string) {
await s3.putObject({ Bucket: process.env.AWS_BUCKET!, Key: key, Body: buffer, ContentType: contentType, ACL: 'public-read' }).promise();
return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}