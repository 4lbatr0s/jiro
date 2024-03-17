# Jiro - ChatGPT Powered Document Chat Application

![Jiro](/public/dashboard-preview.png)

Jiro is a SaaS application designed to revolutionize document interaction. It leverages the power of OpenAI's ChatGPT in the background to enable users to converse with their documents effortlessly. Whether you need to summarize, analyze, or simply interact with your PDF files, Jiro provides a seamless conversational interface to make your document experience more intuitive and efficient.

## Features

- **Document Interaction**: Upload your PDF files and converse with them in natural language using ChatGPT.
- **Semantic Similarity Search**: Utilizes Pinecone's vector store for semantic similarity search within documents.
- **PDF Rendering**: View PDF files directly within the application using the React PDF library.
- **Optimistic Updates**: Provides a responsive user experience through optimistic updates.
- **Infinite Queries**: Ensures smooth scrolling and interaction with documents.
- **Authentication**: Secure user authentication powered by Kinde.
- **Payment Integration**: Seamlessly manage subscriptions and payments with Stripe.
- **Cloud Infrastructure**: Utilizes AWS S3 for file storage and PlanetScale for MySQL database hosting.
- **Deployment**: Deployed on the Vercel platform for scalability and reliability.
- **State Management**: Uses React Context API for efficient state management.
- **UI Components**: Designed with Shadcn UI components for a sleek and modern interface.

## Technologies Used

- **Frontend**: Next.js, tRPC, React PDF, Shadcn UI components, Vercel AI package.
- **Backend**: MySQL (PlanetScale), Prisma, Langchain for prompt handling.
- **Cloud Services**: AWS S3 (via Uploadthing), Pinecone for semantic similarity search.
- **Authentication**: Kinde.
- **Payment**: Stripe.
- **Deployment**: Vercel.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/4lbatr0s/jiro.git
```

2. Install dependencies:

```bash
cd jiro
npm install
# or
yarn install
```

3. Create environment variables:

Create a `.env` file in the root directory and add the necessary environment variables. Refer to `.env.example` for required variables.

4. Run the application:

```bash
npm run dev
# or
yarn dev
```

5. Visit `http://localhost:3000` in your browser to use the application.

## Usage

1. Sign up or log in to your account.
2. Upload a PDF document.
3. Interact with your document using natural language in the chat interface.
4. Explore semantic similarity search within your documents.
5. Manage your subscription and payments using the integrated Stripe functionality.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the [MIT License](https://github.com/git/git-scm.com/blob/main/MIT-LICENSE.txt).

## Acknowledgements

- OpenAI for providing the ChatGPT model.
- Pinecone for semantic similarity search capabilities.
- Shadcn for UI components.
- AWS, PlanetScale, Stripe, and Vercel for their respective services that power the application.

---

**Note**: For any questions or support, please contact serhatoner@protonmail.com.