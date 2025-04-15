# Simple Survey Client

This is the frontend for the **Simple Survey App**, a web-based application that allows users to fill out surveys with a variety of question types including text, multiple choice, and file uploads.

## 🌐 Live Application
You can access the deployed frontend here: [Simple Survey Client](https://simple-survey-client.onrender.com/survey)

## 🚀 Features
- Clean and responsive UI for survey-taking
- Dynamic rendering of questions (text input, multiple choice, file upload)
- File validation based on size and type
- Real-time feedback and validation
- Submission handling with feedback on success/failure

## 🛠️ Technologies Used
- React
- TailwindCSS / Flowbite-React (UI Components)
- Axios (API Requests)
- React Router DOM

## 📦 Installation
If you'd like to run the project locally:

```bash
# Clone the repo
https://github.com/your-username/simple-survey-client.git

cd simple-survey-client

cd simple-survey-ui

# Install dependencies
npm install

# Run the development server
npm start
```

## 🔗 API Integration
This client connects to a backend API that handles survey data (questions, options, and responses). Make sure to configure the API URL in your `.env` file if running locally:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

## 📁 Project Structure
```
src/
├── components/       # Reusable components
├── pages/            # Pages like Survey
├── services/         # API integration
├── App.js            # Routing
└── index.js          # Entry point
```

## 📋 How to Use
1. Visit the live URL or run the client locally.
2. The survey page will fetch and render questions dynamically.
3. Fill in all required fields, upload files (if any), and click submit.
4. You'll get a success message upon valid submission.

## 🧪 Future Improvements
- Authentication for survey takers
- Admin dashboard to create/edit questions
- Enhanced UI/UX
- Multi-page survey flows

## 🤝 Contributions
Feel free to fork and contribute by submitting a pull request.

---

For any issues or suggestions, please open an issue on the GitHub repository.

**Enjoy using Simple Survey!**

