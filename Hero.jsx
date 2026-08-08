
import { motion } from "framer-motion";
import { ArrowRight, Mic, Sparkles, Upload } from "lucide-react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section
      className="
        min-h-screen
        flex
        items-center
        justify-center
        px-6
        pt-32
      "
    >
      <div
        className="
          max-w-6xl
          mx-auto
          grid
          lg:grid-cols-2
          gap-12
          items-center
        "
      >
        {/* Left Content */}
        <motion.div
          initial={{
            opacity: 0,
            x: -50,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
          }}
        >
          {/* Badge */}
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              glass
              text-purple-300
              mb-6
            "
          >
            <Sparkles size={18} />
            AI Powered Meeting Intelligence
          </div>

          {/* Heading */}
          <h1
            className="
              text-5xl
              md:text-7xl
              font-bold
              leading-tight
            "
          >
            Transform Every Meeting Into

            <span
              className="
                block
                bg-gradient-to-r
                from-purple-400
                to-blue-400
                bg-clip-text
                text-transparent
              "
            >
              Smart Knowledge
            </span>
          </h1>

          {/* Description */}
          <p
            className="
              mt-6
              text-lg
              text-gray-400
              max-w-xl
            "
          >
            MeetMind AI converts your meetings into
            intelligent summaries, action items,
            decisions, and searchable knowledge using
            advanced AI.
          </p>

          {/* Buttons */}
          <div
            className="
              flex
              flex-wrap
              gap-4
              mt-8
            "
          >
            {/* Upload Meeting */}
            <Link
              to="/upload-meeting"
              className="
                flex
                items-center
                gap-2
                px-6
                py-3
                rounded-xl
                bg-gradient-to-r
                from-purple-500
                to-blue-500
                font-semibold
                text-white
                hover:scale-105
                transition
                ai-glow
              "
            >
              <Upload size={20} />

              Upload Meeting

              <ArrowRight size={18} />
            </Link>

            {/* Live Demo */}
            <Link
              to="/login"
              className="
                flex
                items-center
                gap-2
                px-6
                py-3
                rounded-xl
                glass
                text-white
                hover:bg-white/10
                transition
              "
            >
              <Mic size={20} />

              Live Demo
            </Link>
          </div>
        </motion.div>

        {/* Right AI Card */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
          }}
          className="relative"
        >
          <div
            className="
              glass
              p-8
              ai-glow
            "
          >
            {/* Header */}
            <div
              className="
                flex
                items-center
                gap-3
                mb-8
              "
            >
              <div
                className="
                  w-12
                  h-12
                  rounded-xl
                  bg-purple-500/20
                  flex
                  items-center
                  justify-center
                "
              >
                <Mic />
              </div>

              <div>
                <h3 className="font-bold text-xl">
                  AI Meeting Analysis
                </h3>

                <p className="text-gray-400">
                  Processing conversation...
                </p>
              </div>
            </div>

            {/* AI Wave */}
            <div
              className="
                flex
                items-center
                justify-center
                gap-2
                h-32
              "
            >
              {Array.from({ length: 12 }).map(
                (_, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      height: [
                        20,
                        80,
                        40,
                        100,
                        20,
                      ],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: index * 0.1,
                    }}
                    className="
                      w-2
                      rounded-full
                      bg-gradient-to-t
                      from-purple-500
                      to-blue-500
                    "
                  />
                )
              )}
            </div>

            {/* Stats */}
            <div
              className="
                mt-6
                grid
                grid-cols-3
                gap-4
              "
            >
              <div className="glass p-4 text-center">
                <h4 className="font-bold">
                  95%
                </h4>

                <p className="text-sm text-gray-400">
                  Accuracy
                </p>
              </div>

              <div className="glass p-4 text-center">
                <h4 className="font-bold">
                  10x
                </h4>

                <p className="text-sm text-gray-400">
                  Faster
                </p>
              </div>

              <div className="glass p-4 text-center">
                <h4 className="font-bold">
                  AI
                </h4>

                <p className="text-sm text-gray-400">
                  Powered
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
