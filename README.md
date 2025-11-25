# Lingua - Real-time AI Translation Platform

**Lingua** is a powerful real-time translation and AI processing platform that integrates modern web technologies with advanced AI models. It supports text translation, optical character recognition (OCR) for images, speech-to-text conversion, and document parsing.

## 🚀 Features

-   **Real-time Translation**: Instant text translation via WebSocket.
-   **OCR (Optical Character Recognition)**: Extract text from images (PNG, JPG, etc.) using EasyOCR.
-   **Speech-to-Text**: Convert voice audio to text using Vosk (Offline model).
-   **Document Parsing**: Extract and translate content from `.docx` and `.pdf` files.
-   **Smart File Detection**: Automatically detects file types (via magic bytes) even without extensions.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: React 19 + Vite
-   **Language**: TypeScript
-   **Styling**: TailwindCSS
-   **Real-time**: Socket.io Client

### Backend Gateway (Node.js)
-   **Role**: API Gateway & Real-time Server
-   **Framework**: Express.js
-   **Communication**: Socket.io
-   **Function**: Handles client connections, validates requests, and proxies heavy AI tasks to the Python service.

### AI Services (Python)
-   **Role**: AI Inference Engine
-   **Framework**: FastAPI + Uvicorn
-   **Models**:
    -   **OCR**: EasyOCR
    -   **Speech**: Vosk
    -   **Translation**: Helsinki-NLP (Hugging Face)
-   **Function**: Performs CPU-bound tasks (Inference) and returns results to the Gateway.

## 🏗️ Architecture

The project follows a **Gateway Pattern**:
1.  **Client** sends requests (Text/Image/Audio) to the **Node.js Gateway** via Socket.io/HTTP.
2.  **Gateway** validates and forwards the request to the **Python AI Service**.
3.  **Python Service** processes the data (Inference) and returns the result.
4.  **Gateway** pushes the result back to the **Client** in real-time.

## 📦 Installation & Setup

### Prerequisites
-   Node.js (v18+)
-   Python (v3.8+)
-   Git

### 1. Clone the Repository
```bash
git clone https://github.com/hwy184/lingua_Translate_realtime.git
cd lingua_Translate_realtime
```

### 2. Setup Frontend (Lingua_client)
```bash
cd Lingua_client
npm install
# Create .env if needed
```

### 3. Setup Backend Gateway (backend_gateway)
```bash
cd backend_gateway
npm install
```

### 4. Setup AI Services (python-services)
```bash
cd python-services
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
*Note: You may need to download Vosk models manually if not included in the repo.*

## 🏃‍♂️ Running the Application

You can run all services simultaneously using the helper script:

```bash
# From the root directory
chmod +x run-all.sh
./run-all.sh
```

Or run them individually in separate terminals:

1.  **Python AI Service**:
    ```bash
    cd python-services
    source venv/bin/activate
    python main.py
    ```
2.  **Backend Gateway**:
    ```bash
    cd backend_gateway
    npm run dev
    ```
3.  **Frontend**:
    ```bash
    cd Lingua_client
    npm run dev
    ```

## 🔮 Future Roadmap

-   **Dockerization**: Containerize all services for easy deployment.
-   **Message Queue (RabbitMQ)**: Decouple Gateway and AI Service for better scalability.
-   **Redis Caching**: Cache translation results to improve performance and reduce AI load.
-   **Worker Mode**: Convert Python service to background workers for handling heavy queues.

## 📄 License

[MIT](LICENSE)
