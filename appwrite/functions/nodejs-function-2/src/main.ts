export default async ({ req, res, log, error }: any) => {
  return res.json({
    message: 'Hello from Node.js on Appwrite!',
  });
};
