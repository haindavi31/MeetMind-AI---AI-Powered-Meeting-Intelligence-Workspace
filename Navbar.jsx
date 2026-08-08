
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="
        fixed
        top-0
        left-0
        right-0
        z-50
        px-6
        py-5
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          glass
          flex
          items-center
          justify-between
          px-8
          py-4
        "
      >
        {/* Logo */}
        <Link
          to="/"
          className="
            flex
            items-center
            gap-3
            text-xl
            font-bold
          "
        >
          <div
            className="
              w-10
              h-10
              rounded-xl
              bg-gradient-to-br
              from-purple-500
              to-blue-500
              flex
              items-center
              justify-center
              ai-glow
            "
          >
            <Sparkles size={22} />
          </div>

          <span className="text-white">
            MeetMind AI
          </span>
        </Link>

        {/* Navigation Links */}
        <div
          className="
            hidden
            md:flex
            items-center
            gap-8
            text-gray-300
          "
        >
          <a
            href="#features"
            className="hover:text-white transition"
          >
            Features
          </a>

          <a
            href="#how"
            className="hover:text-white transition"
          >
            How it Works
          </a>

          <a
            href="#about"
            className="hover:text-white transition"
          >
            About
          </a>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          {/* Login */}
          <Link
            to="/login"
            className="
              hidden
              sm:block
              text-gray-300
              hover:text-white
              transition
            "
          >
            Login
          </Link>

          {/* Get Started */}
          <Link
            to="/register"
            className="
              px-5
              py-2.5
              rounded-xl
              bg-gradient-to-r
              from-purple-500
              to-blue-500
              text-white
              font-semibold
              hover:scale-105
              transition
              ai-glow
            "
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
