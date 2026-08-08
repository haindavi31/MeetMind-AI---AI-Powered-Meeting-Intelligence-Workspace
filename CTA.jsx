import { motion } from "framer-motion";
import { Rocket, ArrowRight } from "lucide-react";


function CTA() {

  return (

    <section
      className="
        px-6
        py-24
      "
    >

      <motion.div

        initial={{
          opacity:0,
          y:40
        }}

        whileInView={{
          opacity:1,
          y:0
        }}

        transition={{
          duration:0.7
        }}

        viewport={{
          once:true
        }}

        className="
          max-w-5xl
          mx-auto
          glass
          ai-glow
          p-10
          md:p-16
          text-center
        "

      >


        <div
          className="
            w-16
            h-16
            mx-auto
            rounded-2xl
            bg-gradient-to-br
            from-purple-500
            to-blue-500
            flex
            items-center
            justify-center
            mb-6
          "
        >

          <Rocket size={32}/>

        </div>



        <h2
          className="
            text-4xl
            md:text-5xl
            font-bold
          "
        >

          Ready To Make Meetings Smarter?

        </h2>



        <p
          className="
            mt-5
            text-gray-400
            max-w-2xl
            mx-auto
            text-lg
          "
        >

          Let MeetMind AI analyze your conversations,
          create summaries, extract tasks, and build
          your meeting knowledge system.

        </p>



        <button

          className="
            mt-8
            inline-flex
            items-center
            gap-3
            px-8
            py-4
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

          Start Using MeetMind AI

          <ArrowRight size={20}/>

        </button>



      </motion.div>


    </section>

  );

}


export default CTA;