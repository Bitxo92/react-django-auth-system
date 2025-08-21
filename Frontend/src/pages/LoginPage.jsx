import { Player } from "@lottiefiles/react-lottie-player";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row "
      style={{ backgroundImage: "url('./background.jpg')" }}
    >
      {/* Left Section - Animation and Text */}
      <div className="lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 order-2 lg:order-1 space-y-8">
        <div className="w-full max-w-md">
          <Player
            autoplay
            loop
            src="https://lottie.host/6b30836d-d5dd-437f-bbc9-bc713b6984f7/aNN9Aj2Jqo.json"
            className="w-full h-full"
          />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
          <p className="text-lg text-gray-600 max-w-md">
            Continue building and managing your professional CV. Access all your
            documents and make updates in real-time.
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 order-1 lg:order-2 ">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
