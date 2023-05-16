# TicTacTrip-Exercice
The exercice given by TicTacTrip


Justify API

The Justify API is a RESTful web service that allows you to justify text to a specified line length of 80 characters. It provides a simple HTTP endpoint to submit text and receive the justified output.
Features

    Justify text to a line length of 80 characters.
    Support for authentication using JWT (JSON Web Tokens).
    Rate limiting to enforce fair usage of the API.

Getting Started
Prerequisites

    Node.js (v14 or higher)
    npm (Node Package Manager) or yarn

Installation

    Clone the repository:

    bash

git clone https://github.com/Misterwayne/TicTacTrip-Exercice.git

Navigate to the project directory:

bash

cd TicTacTrip-Exercice

Install the dependencies:

bash

npm install

Start the API server:

bash

    npx ts-node app.ts

    The server will start listening on http://localhost:3000.

API Endpoints
Justify Text

    Endpoint: POST /api/justify
    Description: Justifies the input text to a line length of 80 characters.
    Headers:
        Content-Type: text/plain (specify the content type as plain text)
        Authorization: Bearer [JWT_TOKEN] (authentication token)
    Body:
        Provide the text to be justified in the request body as plain text.
    Response:
        Status: 200 OK
        Body: object with the justified text:

        json

        {
          "justifiedText": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed..."
        }

Generate Authentication Token

    Endpoint: POST /api/token
    Description: Generates an authentication token (JWT) for accessing the API.
    Headers:
        Content-Type: application/json (specify the content type as JSON)
    Body:
        Provide the email address in the request body as JSON:

        json

    {
      "email": "your-email@example.com"
    }

Response:

    Status: 200 OK
    Body: JSON object with the generated token:

    json

        {
          "token": "eyJhb......."
        }

Rate Limiting

To ensure fair usage of the API, rate limiting is applied. The rate limit is set to 80,000 words per token. When the word count for a token exceeds this limit, subsequent requests will receive a 402 Payment Required response.
Authentication

The API uses JSON Web Tokens (JWT) for authentication. To access the API endpoints, include the JWT token in the Authorization header with the prefix Bearer. You can obtain a valid token by making a request to the /api/token endpoint with a valid email address.