import { Player } from "@lottiefiles/react-lottie-player";
import RegisterForm from "../components/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Animation and Text */}
      <div className="lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 order-2 lg:order-1 space-y-8">
        <div className="w-full max-w-md">
          <Player
            autoplay
            loop
            src="https://lottie.host/be9f320e-85c4-4d0d-ad21-405a7f7b9f5e/mxddAGDpMT.json"
            className="w-full h-full"
          />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Build Your Professional CV
          </h2>
          <p className="text-lg text-gray-600 max-w-md">
            Create a standout CV that gets you noticed. Join thousands of
            professionals who've successfully landed their dream jobs.
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 order-1 lg:order-2">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
