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

const generateHTML = (secretMessage) => `
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
            .secret { 
              color:red;
              font-weight:bold;
            }
        </style>
    </head>
    <body>
        <div class="message">
              <p>This demo showcases:</p>
              <p>✅ Create IaC with Terraform.</p>
              <p>✅ The retrieval and display of Amazon Secret Keys For demonstration purposes only.</p>
              <p>🔑 Retrieved Secret: <span class="secret">${
                secretMessage.includes("Failed")
                  ? `${secretMessage}`
                  : `${secretMessage}`
              }</span></p>
        </div>
    </body>
</html>
`;

let secretState = {
  value: null,
  error: null,
  isLoading: true,
};

const getSecrets = async () => {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT",
      })
    );

    secretState = {
      value: response.SecretString,
      error: null,
      isLoading: false,
    };

    console.log("Secret retrieved successfully");
  } catch (error) {
    console.error("Failed to retrieve secret:", error);
    secretState = {
      value: null,
      error: "Failed to retrieve secret",
      isLoading: false,
    };
  }
};

getSecrets().catch((error) => {
  console.error("Initial secret retrieval failed:", error);
});

app.get("/", async (req, res) => {
  if (secretState.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const message = secretState.error || secretState.value;
  res.send(generateHTML(message || "Failed to retrieve secret"));
});

app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).send(generateHTML("An unexpected error occurred"));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
