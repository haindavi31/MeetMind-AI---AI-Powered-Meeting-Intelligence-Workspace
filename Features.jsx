import { motion } from "framer-motion";
import {
  Brain,
  MessageCircle,
  CheckCircle,
  BarChart3,
  FileText,
  Search
} from "lucide-react";


function Features() {


  const features = [

    {
      icon: Brain,
      title: "AI Meeting Summary",
      description:
        "Automatically converts long meetings into clear and structured summaries."
    },

    {
      icon: CheckCircle,
      title: "Action Item Extraction",
      description:
        "Identifies tasks, responsibilities, and deadlines from conversations."
    },

    {
      icon: MessageCircle,
      title: "Chat With Your Meeting",
      description:
        "Ask questions and get answers from your meeting using RAG AI."
    },

    {
      icon: BarChart3,
      title: "Meeting Analytics",
      description:
        "Understand productivity, speaker activity, and meeting insights."
    },

    {
      icon: FileText,
      title: "Smart Notes",
      description:
        "Generate organized notes with important decisions and highlights."
    },

    {
      icon: Search,
      title: "Knowledge Search",
      description:
        "Search across previous meetings and find information instantly."
    }

  ];



  return (

    <section
      id="features"
      className="
        py-24
        px-6
      "
    >

      <div
        className="
          max-w-6xl
          mx-auto
        "
      >


        <motion.div

          initial={{
            opacity:0,
            y:30
          }}

          whileInView={{
            opacity:1,
            y:0
          }}

          transition={{
            duration:0.6
          }}

          viewport={{
            once:true
          }}

          className="
            text-center
            mb-14
          "

        >


          <h2
            className="
              text-4xl
              md:text-5xl
              font-bold
            "
          >

            Powerful AI Meeting Features

          </h2>


          <p
            className="
              mt-4
              text-gray-400
              max-w-2xl
              mx-auto
            "
          >

            Everything you need to transform conversations
            into actionable intelligence.

          </p>


        </motion.div>




        <div
          className="
            grid
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
          "
        >


          {
            features.map((feature,index)=>{


              const Icon = feature.icon;


              return (

                <motion.div

                  key={index}

                  initial={{
                    opacity:0,
                    y:40
                  }}

                  whileInView={{
                    opacity:1,
                    y:0
                  }}

                  transition={{
                    delay:index*0.1
                  }}

                  viewport={{
                    once:true
                  }}

                  className="
                    glass
                    p-6
                    hover:scale-105
                    transition
                  "

                >


                  <div
                    className="
                      w-12
                      h-12
                      rounded-xl
                      bg-gradient-to-br
                      from-purple-500
                      to-blue-500
                      flex
                      items-center
                      justify-center
                      mb-5
                    "
                  >

                    <Icon size={24}/>

                  </div>



                  <h3
                    className="
                      text-xl
                      font-bold
                      mb-3
                    "
                  >

                    {feature.title}

                  </h3>



                  <p
                    className="
                      text-gray-400
                    "
                  >

                    {feature.description}

                  </p>


                </motion.div>

              );


            })
          }


        </div>


      </div>


    </section>

  );

}


export default Features;