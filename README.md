# Jix Cv Search API

Jix CV Search API is an Express-based API that allows HR to search for and download CVs and related documents from their Gmail account. The API fetches emails with attachments, extracts and provides download links for the attachments.

## Features

- Authenticate with Google OAuth2
- Fetch emails with attachments
- Extract attachment details
- Provide download links for attachments
- Return email sender name and email address in the response

## Prerequisites

- Node.js
- npm or yarn
- Google Cloud project with Gmail API enabled
- OAuth2 credentials (Client ID and Client Secret)

## Installation

1. Clone the repository:

   ```bash
   git clone 
   ```

2. Navigate to the project directory:

   ```bash
   cd jix-cv-search-backend

   ```

3. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

4. Create a `credentials.json` file in the root directory and add your environment variables:

   ```json
   {
     "web": {
       "client_id": "your-client-id",
       "project_id": "your-project-id",
       "auth_uri": "your-auth-uri",
       "token_uri": "your-token-uri",
       "auth_provider_x509_cert_url": "your-auth-provider-x509-cert-url",
       "client_secret": "your-client_secret",
       "redirect_uris": ["your-redirect-uris"],
       "javascript_origins": ["your-javascript-origins"]
     }
   }
   ```

## Usage

1. Build the project:

   ```bash
   $ yarn build
   ```

2. Start the server:

   ```bash
   $ yarn start
   ```

3. In development mode with hot-reloading:

   ```bash
   $ yarn dev
   ```

4. Visit `{baseURL}/api/search?q={searchQuery}` to initiate the Google OAuth2 flow.

## API Endpoints

- `GET /api`: Redirect to Google OAuth2 consent page
- `GET /api/success`: Handle OAuth2 callback and obtain tokens
- `GET /api/search?q={searchQuery}`: Fetch emails with attachments
- `GET /api/download/:messageId/:attachmentId`: Download attachment by message and attachment ID

## Author

- [Emmanuel Ngendahimana](https://github.com/Emmyfrank)
