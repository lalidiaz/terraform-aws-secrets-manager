const express = require("express");
const app = express();
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

app.use(express.static("public"));

const secret_name = "secret_terraform_challenge";
const client = new SecretsManagerClient({
  region: "us-west-2",
});

let secret;
const getSecrets = async () => {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT",
      })
    );

    secret = response.SecretString;

    console.log("secret", secret);
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

getSecrets();

app.get("/", async (req, res) => {
  if (!secret) {
    res.status(500).send(` <!DOCTYPE html>
         <html>
             <head>
                 <title>My Express Server</title>
                 <style>
                     body {
                         font-family: Arial, sans-serif;
                         display: flex;
                         justify-content: center;
                         align-items: center;
                         height: 100vh;
                         margin: 0;
                         background-color: #f0f0f0;
                     }
                     .message {
                         font-size: 24px;
                         padding: 20px;
                         background-color: white;
                         border-radius: 8px;
                         box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                     }
                 </style>
             </head>
             <body>
                <p>🔑 Retrieved Secret: Failed to retrieve secret</p>
             </body>
         </html>`);
  }

  res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>My Express Server</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f0f0f0;
                    }
                    .message {
                        font-size: 24px;
                        padding: 20px;
                        background-color: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                </style>
            </head>
            <body>
                <div class="message">
                    <p>This demo showcases:</p>
                   <p> ✅ Create IaC with Terraform.</p>
                   <p> ✅ The retrieval and display of Amazon Secret Keys For demonstration purposes only.</p>
                    <p>🔑 Retrieved Secret: ${secret}</p>
                </div>
            </body>
        </html>
    `);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
