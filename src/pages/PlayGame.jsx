import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CrownOutlined,
  FireOutlined,
  LoadingOutlined,
  RocketOutlined,
  StarOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  message,
  Result,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";
import "../../public/play_game.css";
import { KeycloakContext } from "../components/KeycloakProvider";

const { Title, Text, Paragraph } = Typography;

const PlayGame = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Game states
  const [gameState, setGameState] = useState("CONNECTING");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [pendingScore, setPendingScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("CONNECTING");
  const [participants, setParticipants] = useState(0);
  const [milestone, setMilestone] = useState(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const { username } = useContext(KeycloakContext);

  // Milestone configurations
  const milestoneConfig = {
    STREAK_3: {
      title: "🔥 Streak x3!",
      description: "Bạn đã trả lời đúng 3 câu liên tiếp!",
      color: "from-orange-400 to-red-500",
      icon: "🔥",
      emoji: "🎯",
      particles: 200,
    },
    STREAK_5: {
      title: "⚡ Streak x5!",
      description: "Xuất sắc! 5 câu đúng liên tiếp!",
      color: "from-yellow-400 to-orange-500",
      icon: "⚡",
      emoji: "🌟",
      particles: 300,
    },
    STREAK_8: {
      title: "💎 Streak x8!",
      description: "Tuyệt vời! 8 câu đúng liên tiếp!",
      color: "from-blue-400 to-purple-500",
      icon: "💎",
      emoji: "🚀",
      particles: 400,
    },
    STREAK_10: {
      title: "👑 Streak x10!",
      description: "Huyền thoại! 10 câu đúng liên tiếp!",
      color: "from-purple-500 to-pink-500",
      icon: "👑",
      emoji: "🏆",
      particles: 500,
    },
  };

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // WebSocket connection
  const connectWebSocket = () => {
    try {
      const token = localStorage.getItem("kc_token");
      const gatewayUrl = `ws://103.90.224.152:8088/ws/events?token=${token}&eventId=${eventId}`;
      const wsUrl = gatewayUrl;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected successfully");
        setConnectionStatus("CONNECTED");
        setGameState("WAITING");

        sendMessage({
          type: "JOIN_EVENT",
          eventId: eventId,
          clientTime: Date.now(),
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
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

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
      messageApi.error("Mất kết nối. Đang thử kết nối lại...");
    }
  };

  const handleWebSocketMessage = (data) => {
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
        setQuestionNumber(payload.index + 1);
        setTimeLeft(payload.timeLimit || 30);
        setCurrentScore(payload.score || 10);
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
        setPendingScore(0);
        break;

      case "SCORING":
        messageApi.success(
          payload.description || "Hệ thống đang thực hiện chấm điểm!",
        );
        break;

      case "MILESTONE_UPDATE":
        // Handle milestone notification
        setMilestone({
          milestoneCode: data.milestoneCode,
          description: data.description,
          username: data.username
        });
        setShowMilestone(true);

        // Auto hide after 3 seconds
        setTimeout(() => {
          setShowMilestone(false);
        }, 5000);
        break;

      case "GAME_RESULT":
        setGameState("FINISHED");
        setShowConfetti(true);
        const vouchers = data.vouchers || [];
        const receivedVoucher = vouchers.find(
          (voucher) => voucher.username === username,
        );
        const currentUser = payload.find((user) => user.username === username);
        const currentIndex = payload.findIndex(
          (user) => user.username === username,
        );

        const finalScore = currentUser?.score ?? score;
        const rank = currentIndex >= 0 ? currentIndex + 1 : "N/A";

        setGameResult({
          username: username,
          correct: currentUser?.correct || 0,
          score: finalScore,
          rank: rank,
          voucher: receivedVoucher ? receivedVoucher : null,
        });

        setTimeout(() => setShowConfetti(false), 5000);
        break;

      case "PLAYER_PARTICIPATED":
        const playerUsername = payload.username || "Một người chơi";
        messageApi.info(`👤 ${playerUsername} đã tham gia trò chơi`);
        const participants = data.participants || 0;
        setParticipants(participants);
        break;

      case "PLAYER_LEFT":
        const userLeft = payload.username || "Một người chơi";
        messageApi.info(`👤 ${userLeft} đã rời trò chơi`);
        setParticipants(data.participants || 0);
        break;

      case "ERROR":
        console.error("❌ Server error:", data);
        messageApi.error(data.message || "Đã xảy ra lỗi");
        if (data.code === "NOT_REGISTERED") {
          setTimeout(() => navigate(`/events/${eventId}`), 2000);
        }
        break;

      case "WAITING":
        setGameState("WAITING");
        messageApi.info(data.message || "Đang chờ game bắt đầu...");
        break;

      default:
        console.warn("⚠️ Unknown message type:", data.type);
    }
  };

  const handleSubmitAnswer = (answerId) => {
    if (isAnswerSubmitted) return;

    setSelectedAnswer(answerId);
    setIsAnswerSubmitted(true);

    const correct =
      currentAnswers.find((ans) => ans.answerId === Number(answerId))
        ?.correct ?? false;

    if (correct) {
      setPendingScore(currentScore);
    } else {
      setPendingScore(0);
    }

    sendMessage({
      type: "PLAYER_ANSWER",
      eventId: eventId,
      questionId: currentQuestion?.id,
      clientTime: Date.now(),
      isCorrect: correct,
      username: username,
    });
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [eventId]);

  useEffect(() => {
    if (gameState !== "PLAYING" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!isAnswerSubmitted) {
            setIsAnswerSubmitted(true);
          }
          if (pendingScore > 0) {
            setScore((currentScore) => currentScore + pendingScore);
            setPendingScore(0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, isAnswerSubmitted, pendingScore]);

  const renderMilestoneNotification = () => {
    if (!showMilestone || !milestone) return null;

    const config = milestoneConfig[milestone.milestoneCode];
    if (!config) return null;

    const isCurrentUser = milestone.username === username;

    return (
      <>
        {/* Confetti for milestone - lighter effect */}
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={isCurrentUser ? config.particles : 100}
          gravity={0.3}
          style={{ pointerEvents: "none" }}
        />

        {/* Milestone Notification - Bottom Right Corner */}
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
          }}
          className="fixed bottom-8 right-8 z-50"
          style={{
            maxWidth: "420px",
            pointerEvents: "none",
          }}
        >
          {/* Glowing background effect */}
          <div className="absolute inset-0 blur-2xl opacity-40">
            <div
              className={`w-full h-full bg-gradient-to-r ${config.color} rounded-3xl`}
            ></div>
          </div>

          {/* Main milestone card */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Gradient border effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-20`}
            ></div>

            {/* Content */}
            <div className="relative p-6">
              {/* Icon and Title Row */}
              <div className="flex items-center gap-4 mb-3">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: 2,
                    repeatDelay: 0.2,
                  }}
                  className="flex-shrink-0"
                >
                  <span className="text-5xl">{config.icon}</span>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.h3
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`text-2xl font-black bg-gradient-to-r ${config.color} bg-clip-text text-transparent mb-1`}
                  >
                    {config.title}
                  </motion.h3>

                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-gray-600 font-medium"
                  >
                    {config.description}
                  </motion.p>
                </div>
              </div>

              {/* Username Badge */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 mt-3"
              >
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.color} bg-opacity-10 backdrop-blur-sm`}
                >
                  <span className="text-xl">{config.emoji}</span>
                  <span
                    className={`text-sm font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}
                  >
                    {isCurrentUser ? "Bạn" : milestone.username}
                  </span>
                  {isCurrentUser && (
                    <span className="text-xs font-semibold text-gray-600">
                      đã đạt được!
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Custom description from server */}
              {milestone.description && (
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs text-gray-500 italic mt-2"
                >
                  {milestone.description}
                </motion.p>
              )}

              {/* Decorative particles - fewer particles */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: Math.random() * 100 + "%",
                      y: "100%",
                      opacity: 0,
                    }}
                    animate={{
                      y: "-20%",
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: Math.random() * 2 + 1.5,
                      delay: Math.random() * 0.3,
                      repeat: Infinity,
                      repeatDelay: Math.random() * 1.5,
                    }}
                    className={`absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r ${config.color}`}
                  />
                ))}
              </div>
            </div>

            {/* Progress bar for auto-hide */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 4, ease: "linear" }}
              className={`h-1 bg-gradient-to-r ${config.color} origin-left`}
            />
          </motion.div>

          {/* Outer glow ring - smaller effect */}
          <motion.div
            animate={{
              scale: [1, 1.15],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className={`absolute inset-0 border-2 bg-gradient-to-r ${config.color} rounded-2xl`}
            style={{
              borderColor: "transparent",
              background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
            }}
          />
        </motion.div>
      </>
    );
  };

  const renderConnectionStatus = () => {
    const statusConfig = {
      CONNECTING: {
        color: "processing",
        text: "Đang kết nối...",
        icon: <LoadingOutlined spin />,
      },
      CONNECTED: {
        color: "success",
        text: "Đã kết nối",
        icon: <CheckCircleOutlined />,
      },
      DISCONNECTED: {
        color: "error",
        text: "Mất kết nối",
        icon: <CloseCircleOutlined />,
      },
      ERROR: {
        color: "error",
        text: "Lỗi kết nối",
        icon: <WarningOutlined />,
      },
    };

    const config = statusConfig[connectionStatus];
    return (
      <Tag
        color={config.color}
        icon={config.icon}
        className="px-4 py-2 text-base"
      >
        {config.text}
      </Tag>
    );
  };

  const renderWaitingScreen = () => (
    <div className="game-container">
      {contextHolder}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="game-card p-8">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-6"
              >
                <RocketOutlined className="text-7xl text-purple-600" />
              </motion.div>

              <Title
                level={1}
                className="mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              >
                Đang chờ trò chơi bắt đầu...
              </Title>

              <Paragraph className="text-xl text-gray-600 mb-8">
                Vui lòng đợi host bắt đầu trò chơi
              </Paragraph>

              <Divider />

              <Space direction="vertical" size="large" className="w-full">
                <div>{renderConnectionStatus()}</div>

                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="participant-badge"
                >
                  <FireOutlined />
                  <span>{participants} người chơi</span>
                </motion.div>

                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate(`/events/${eventId}`)}
                  size="large"
                  className="mt-4"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    color: "white",
                    height: "50px",
                    fontSize: "16px",
                    borderRadius: "25px",
                  }}
                >
                  Quay lại
                </Button>
              </Space>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderPlayingScreen = () => {
    if (!currentQuestion) return null;

    const progress =
      totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0;

    return (
      <div className="game-container">
        {contextHolder}
        <AnimatePresence>{renderMilestoneNotification()}</AnimatePresence>

        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>

        <div className="max-w-6xl mx-auto p-4">
          {/* Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="game-card p-6 mb-4">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={8} className="text-center">
                  <Text strong className="text-xl block mb-2">
                    Câu hỏi {questionNumber}/{totalQuestions}
                  </Text>
                  <div className="progress-bar-custom">
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: "white",
                        borderRadius: "10px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="text-center">
                    <motion.div
                      animate={timeLeft <= 5 ? { scale: [1, 1.2, 1] } : {}}
                      transition={{
                        duration: 0.5,
                        repeat: timeLeft <= 5 ? Infinity : 0,
                      }}
                    >
                      <ClockCircleOutlined
                        className="text-4xl mr-2"
                        style={{ color: timeLeft <= 5 ? "#f5222d" : "#1890ff" }}
                      />
                      <span
                        className="text-4xl font-bold"
                        style={{ color: timeLeft <= 5 ? "#f5222d" : "#1890ff" }}
                      >
                        {timeLeft}s
                      </span>
                    </motion.div>
                  </div>
                </Col>
              </Row>
            </div>
          </motion.div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <div className="game-card p-8 mb-4">
                <Title
                  level={2}
                  className="text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
                >
                  {currentQuestion.content}
                </Title>

                {currentQuestion.imageUrl && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-6"
                  >
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Question"
                      className="max-w-full max-h-96 mx-auto rounded-2xl shadow-2xl"
                    />
                  </motion.div>
                )}

                {/* Answers */}
                <Row gutter={[16, 16]} className="mt-8">
                  {currentAnswers?.map((answer, index) => {
                    const isSelected = selectedAnswer === answer.id;
                    const isCorrect = isAnswerSubmitted && answer.correct;
                    const isWrong =
                      isAnswerSubmitted && isSelected && !answer.correct;

                    return (
                      <Col xs={24} sm={12} key={answer.id}>
                        <motion.div
                          whileHover={
                            !isAnswerSubmitted ? { scale: 1.05, y: -5 } : {}
                          }
                          whileTap={!isAnswerSubmitted ? { scale: 0.95 } : {}}
                        >
                          <div
                            className={`answer-card p-6 ${
                              isCorrect ? "answer-correct" : ""
                            } ${isWrong ? "answer-wrong" : ""} ${
                              isSelected && !isAnswerSubmitted
                                ? "answer-selected"
                                : ""
                            }`}
                            onClick={() =>
                              !isAnswerSubmitted &&
                              handleSubmitAnswer(answer.answerId)
                            }
                            style={{
                              cursor: isAnswerSubmitted
                                ? "not-allowed"
                                : "pointer",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                                  style={{
                                    background:
                                      isCorrect || isWrong
                                        ? "rgba(255, 255, 255, 0.3)"
                                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                  }}
                                >
                                  {String.fromCharCode(65 + index)}
                                </div>
                                <Text
                                  strong
                                  className="text-lg"
                                  style={{
                                    color:
                                      isCorrect || isWrong
                                        ? "white"
                                        : "inherit",
                                  }}
                                >
                                  {answer.answerText}
                                </Text>
                              </div>
                              {isCorrect && (
                                <CheckCircleOutlined className="text-3xl text-white" />
                              )}
                              {isWrong && (
                                <CloseCircleOutlined className="text-3xl text-white" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Connection Status */}
          <div className="text-center mt-4">{renderConnectionStatus()}</div>
        </div>
      </div>
    );
  };

  const renderResultScreen = () => (
    <div className="game-container">
      {contextHolder}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <div className="game-card p-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="text-center mb-6"
            >
              <TrophyOutlined className="result-trophy text-yellow-500" />
            </motion.div>

            <Title
              level={1}
              className="text-center mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent"
            >
              🎉 Hoàn thành trò chơi!
            </Title>

            <div className="text-center mb-8">
              <div className="inline-block score-badge text-4xl py-4 px-8">
                <StarOutlined className="mr-3" />
                {gameResult?.score || score} điểm
              </div>
            </div>

            {gameResult?.rank && (
              <div className="text-center mb-6">
                <Tag
                  color="purple"
                  className="text-2xl py-3 px-6"
                  icon={<CrownOutlined />}
                >
                  Hạng {gameResult.rank}
                </Tag>
              </div>
            )}

            {gameResult?.voucher && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="voucher-card mb-6"
              >
                <Title
                  level={3}
                  className="text-white mb-4 flex items-center gap-2"
                >
                  <ThunderboltOutlined />
                  Chúc mừng! Bạn đã nhận được voucher
                </Title>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-white text-lg mb-2">
                    Mã voucher:{" "}
                    <Text code strong className="text-2xl bg-white px-4 py-2">
                      {gameResult.voucher.code}
                    </Text>
                  </p>
                  <p className="text-white text-lg mb-2">
                    Giảm giá:{" "}
                    <span className="text-2xl font-bold text-yellow-300">
                      {gameResult.voucher.discountPercentage
                        ? `${gameResult.voucher.discountPercentage}%`
                        : `${gameResult.voucher.value.toLocaleString(
                            "vi-VN",
                          )} VNĐ`}
                    </span>
                  </p>
                  {gameResult.voucher.maxValue && (
                    <p className="text-white text-lg">
                      Giá trị tối đa:{" "}
                      <span className="text-2xl font-bold text-yellow-300">
                        {gameResult.voucher.maxValue.toLocaleString("vi-VN")}{" "}
                        VNĐ
                      </span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            <Space className="w-full justify-center mt-8" size="large">
              <Button
                type="primary"
                size="large"
                onClick={() => navigate(`/events/${eventId}`)}
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  height: "55px",
                  fontSize: "18px",
                  borderRadius: "27px",
                  padding: "0 40px",
                }}
              >
                Quay lại sự kiện
              </Button>
              <Button
                size="large"
                onClick={() => navigate("/events")}
                style={{
                  height: "55px",
                  fontSize: "18px",
                  borderRadius: "27px",
                  padding: "0 40px",
                }}
              >
                Danh sách sự kiện
              </Button>
            </Space>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderErrorScreen = () => (
    <div className="game-container">
      {contextHolder}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="game-card p-8">
            <Result
              status="error"
              title={<span className="text-3xl">Lỗi kết nối</span>}
              subTitle="Không thể kết nối tới server. Vui lòng thử lại sau."
              extra={[
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    setGameState("CONNECTING");
                    connectWebSocket();
                  }}
                  key="retry"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    height: "50px",
                    fontSize: "16px",
                    borderRadius: "25px",
                  }}
                >
                  Thử lại
                </Button>,
                <Button
                  size="large"
                  onClick={() => navigate(`/events/${eventId}`)}
                  key="back"
                  style={{
                    height: "50px",
                    fontSize: "16px",
                    borderRadius: "25px",
                  }}
                >
                  Quay lại
                </Button>,
              ]}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );

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
