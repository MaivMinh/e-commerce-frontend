import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  TrophyOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  message,
  Modal,
  Progress,
  Result,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { KeycloakContext } from "../components/KeycloakProvider";

const { Title, Text, Paragraph } = Typography;
const { Countdown } = Statistic;

const PlayGame = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Game states
  const [gameState, setGameState] = useState("CONNECTING");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("CONNECTING");
  const [participants, setParticipants] = useState(0);
  const { username } = useContext(KeycloakContext);

  // WebSocket connection
  const connectWebSocket = () => {
    try {
      // Để test trực tiếp realtime-gateway (bỏ qua API Gateway), dùng port của realtime-gateway
      const token = localStorage.getItem("kc_token");

      const gatewayUrl = `ws://localhost:8088/ws/events?token=${token}&eventId=${eventId}`;
      const wsUrl = gatewayUrl;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected successfully");
        setConnectionStatus("CONNECTED");
        setGameState("WAITING");

        // Send join event message
        sendMessage({
          type: "JOIN_EVENT",
          eventId: eventId,
          clientTime: Date.now(),
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received message:", data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("ERROR");
        messageApi.error("Lỗi kết nối. Đang thử kết nối lại...");
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnectionStatus("DISCONNECTED");
      };
    } catch (error) {
      console.error("Error connecting WebSocket:", error);
      setConnectionStatus("ERROR");
      setGameState("ERROR");
    }
  };

  // Send message through WebSocket
  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      console.log("Sent message:", message);
    } else {
      console.error("WebSocket is not connected");
      messageApi.error("Mất kết nối. Đang thử kết nối lại...");
    }
  };

  // Handle incoming WebSocket messages
  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (data) => {
    console.log("Received data from server: ", data);
    const payload = data.payload || {};

    switch (data.type) {
      case "CONNECTED":
        messageApi.info(data.message || "Connected to server");
        break;

      case "GAME_READY":
        messageApi.info(payload.description);
        break;

      case "GAME_START":
        setTotalQuestions(payload.totalQuestions || 0);
        setScore(0);
        messageApi.info(payload.description || "Trò chơi sắp bắt đầu!");
        break;

      case "QUESTION":
        setGameState("PLAYING");
        setCurrentQuestion(payload.question);
        setCurrentAnswers(payload.answers || []);
        console.log(payload.answers);
        setQuestionNumber(payload.index + 1);
        setTimeLeft(payload.timeLimit || 30);
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
        break;

      case "SCORING":
        messageApi.success(
          payload.description || "Hệ thống đang thực hiện chấm điểm!"
        );
        break;

      case "GAME_RESULT":
        console.log(payload);
        setGameState("FINISHED");

        const currentUser = payload.find((p) => p.username === username);
        const currentIndex = payload.findIndex((p) => p.username === username);
        const vouchers = data.vouchers || [];

        const receivedVoucher = vouchers.find(
          (voucher) => voucher.username === username
        );
        const finalScore = currentUser?.score ?? score;
        const rank = currentIndex >= 0 ? currentIndex + 1 : "N/A";

        setGameResult({
          username: username,
          correct: currentUser?.correct || 0,
          incorrect: currentUser?.incorrect || 0,
          score: finalScore,
          rank: rank,
          voucher: receivedVoucher ? receivedVoucher : null,
        });
        break;

      case "PLAYER_PARTICIPATED":
        const playerUsername = payload.username || "Một người chơi";
        messageApi.info(`👤 ${playerUsername} đã tham gia trò chơi`);
        setParticipants(data.count || 0);
        break;

      case "ERROR":
        console.error("❌ Server error:", data);
        messageApi.error(data.message || "Đã xảy ra lỗi");
        if (data.code === "NOT_REGISTERED") {
          setTimeout(() => navigate(`/events/${eventId}`), 2000);
        }
        break;

      case "WAITING":
        console.log("⏳ Waiting state");
        setGameState("WAITING");
        messageApi.info(data.message || "Đang chờ game bắt đầu...");
        break;

      default:
        console.warn("⚠️ Unknown message type:", data.type);
        console.warn("   - Full message:", data);
    }
  };

  // Submit answer
  const handleSubmitAnswer = (answerId) => {
    if (isAnswerSubmitted) return;

    setSelectedAnswer(answerId);
    setIsAnswerSubmitted(true);
    const correct =
      currentAnswers.find((ans) => ans.id === answerId)?.correct || false;

    sendMessage({
      type: "PLAYER_ANSWER",
      eventId: eventId,
      questionId: currentQuestion?.id,
      clientTime: Date.now(),
      isCorrect: correct,
      username: username,
    });
  };

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [eventId]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "PLAYING" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto submit when time runs out
          if (!isAnswerSubmitted) {
            handleSubmitAnswer(null);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, isAnswerSubmitted]);

  // Render connection status
  const renderConnectionStatus = () => {
    const statusConfig = {
      CONNECTING: {
        color: "blue",
        text: "Đang kết nối...",
        icon: <LoadingOutlined />,
      },
      CONNECTED: {
        color: "green",
        text: "Đã kết nối",
        icon: <CheckCircleOutlined />,
      },
      DISCONNECTED: {
        color: "red",
        text: "Mất kết nối",
        icon: <CloseCircleOutlined />,
      },
      ERROR: { color: "red", text: "Lỗi kết nối", icon: <WarningOutlined /> },
    };

    const config = statusConfig[connectionStatus];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Render waiting screen
  const renderWaitingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      {contextHolder}
      <Card className="w-full max-w-2xl shadow-2xl">
        <div className="text-center">
          <Spin size="large" />
          <Title level={2} className="mt-6">
            Đang chờ trò chơi bắt đầu...
          </Title>
          <Paragraph className="text-lg text-gray-600">
            Vui lòng đợi host bắt đầu trò chơi
          </Paragraph>

          <Divider />

          <Space direction="vertical" size="large" className="w-full">
            <div>{renderConnectionStatus()}</div>

            <div>
              <Text strong>Người tham gia: </Text>
              <Tag color="blue" className="text-lg px-4 py-1">
                {participants} người
              </Tag>
            </div>

            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/events/${eventId}`)}
              size="large"
            >
              Quay lại
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );

  // Render playing screen
  const renderPlayingScreen = () => {
    if (!currentQuestion) return null;

    const progress =
      totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        {contextHolder}
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <Card className="mb-4 shadow-lg">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8}>
                <Space>
                  <TrophyOutlined className="text-2xl text-yellow-500" />
                  <Statistic title="Điểm số" value={score} />
                </Space>
              </Col>
              <Col xs={24} md={8} className="text-center">
                <Text strong className="text-lg">
                  Câu hỏi {questionNumber}/{totalQuestions}
                </Text>
                <Progress
                  percent={progress}
                  showInfo={false}
                  strokeColor="#722ed1"
                />
              </Col>
              <Col xs={24} md={8} className="text-right">
                <Space>
                  <ClockCircleOutlined className="text-2xl text-red-500" />
                  <Countdown
                    value={Date.now() + timeLeft * 1000}
                    format="ss"
                    valueStyle={{
                      fontSize: "32px",
                      color: timeLeft <= 5 ? "#f5222d" : "#1890ff",
                    }}
                  />
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Question */}
          <Card className="mb-4 shadow-lg">
            <Title level={3} className="text-center mb-6">
              {currentQuestion.content}
            </Title>

            {/* Question Image */}
            {currentQuestion.imageUrl && (
              <div className="text-center mb-6">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question"
                  className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Answers */}
            <Row gutter={[16, 16]}>
              {currentAnswers?.map((answer, index) => {
                const isSelected = selectedAnswer === answer.id;
                const isCorrect = isAnswerSubmitted && answer.correct;
                const isWrong =
                  isAnswerSubmitted && isSelected && !answer.correct;

                let className = "answer-card";
                if (isCorrect) className += " answer-correct";
                else if (isWrong) className += " answer-wrong";
                else if (isSelected) className += " answer-selected";

                return (
                  <Col xs={24} sm={12} key={answer.id}>
                    <Card
                      hoverable={!isAnswerSubmitted}
                      className={className}
                      onClick={() =>
                        !isAnswerSubmitted && handleSubmitAnswer(answer.id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <Text strong className="text-lg">
                          {String.fromCharCode(65 + index)}. {answer.answerText}
                        </Text>
                        {isCorrect && (
                          <CheckCircleOutlined className="text-2xl text-green-500" />
                        )}
                        {isWrong && (
                          <CloseCircleOutlined className="text-2xl text-red-500" />
                        )}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card>

          {/* Connection Status */}
          <div className="text-center">{renderConnectionStatus()}</div>
        </div>
      </div>
    );
  };

  // Render result screen
  const renderResultScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      {contextHolder}
      <Card className="w-full max-w-2xl shadow-2xl">
        <Result
          status="success"
          title="🎉 Hoàn thành trò chơi!"
          subTitle={`Điểm số của bạn: ${gameResult?.score || score} điểm`}
          extra={[
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(`/events/${eventId}`)}
              key="back"
            >
              Quay lại sự kiện
            </Button>,
            <Button
              size="large"
              onClick={() => navigate("/events")}
              key="events"
            >
              Danh sách sự kiện
            </Button>,
          ]}
        >
          {gameResult?.voucher && (
            <Alert
              message="Chúc mừng! Bạn đã nhận được voucher"
              description={
                <div>
                  <p>
                    Mã voucher:{" "}
                    <Text code strong>
                      {gameResult.voucher.code}
                    </Text>
                  </p>
                  <p>
                    Giảm giá:{" "}
                    <Text strong className="text-red-600">
                      {gameResult.voucher.discountPercentage}%
                    </Text>
                  </p>
                </div>
              }
              type="success"
              showIcon
              className="mt-4"
            />
          )}
        </Result>
      </Card>
    </div>
  );

  // Render error screen
  const renderErrorScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      {contextHolder}
      <Card className="w-full max-w-2xl shadow-2xl">
        <Result
          status="error"
          title="Lỗi kết nối"
          subTitle="Không thể kết nối tới server. Vui lòng thử lại sau."
          extra={[
            <Button
              type="primary"
              size="large"
              onClick={() => {
                setReconnectAttempts(0);
                setGameState("CONNECTING");
                connectWebSocket();
              }}
              key="retry"
            >
              Thử lại
            </Button>,
            <Button
              size="large"
              onClick={() => navigate(`/events/${eventId}`)}
              key="back"
            >
              Quay lại
            </Button>,
          ]}
        />
      </Card>
    </div>
  );

  // Main render
  switch (gameState) {
    case "CONNECTING":
      return renderWaitingScreen();
    case "WAITING":
      return renderWaitingScreen();
    case "PLAYING":
      return renderPlayingScreen();
    case "FINISHED":
      return renderResultScreen();
    case "ERROR":
      return renderErrorScreen();
    default:
      return renderWaitingScreen();
  }
};

export default PlayGame;
