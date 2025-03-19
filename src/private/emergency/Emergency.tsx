import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Phone, MapPin, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

const Emergency = () => {
  const emergencyContacts = [
    {
      name: "Dr. Sanjay Gusai",
      role: "Nurse (Bidholi Campus)",
      address: "Basement, Block-5, UPES, Bidholi, Dehradun, Uttarakhand, 248007",
      phone: "+91 7500201816",
    },
    {
      name: "Dr. Shweta Panwar",
      role: "Nurse (Bidholi Campus)",
      address: "Basement, Block-5, UPES, Bidholi, Dehradun, Uttarakhand, 248007",
      phone: "+91 8171323285",
    },
    {
      name: "Dr. Riya Godiyal",
      role: "Nurse (Kandoli Campus)",
      address: "Behind Kandoli Boys Hostel, Tower-1, UPES, Kandoli, Dehradun, Uttarakhand, 248007",
      phone: "+91 9193540530",
    },
    {
      name: "Dr. Manglesh Kanswal",
      role: "Nurse (Kandoli Campus)",
      address: "Behind Kandoli Boys Hostel, Tower-1, UPES, Kandoli, Dehradun, Uttarakhand, 248007",
      phone: "+91 8979840846",
    },
  ];

  return (
    <div className="min-h-[81svh] flex flex-col items-center justify-center gap-8 max-lg:min-h-[93svh] bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center gap-4 text-center"
      >
        <p className="text-lg text-gray-600 max-w-2xl">
          In case of an emergency, reach out to our dedicated team of nurses available on campus.
        </p>
        <img
          src="/emergencyBg.png"
          className="w-[60%] max-w-[400px] mt-4"
          alt="Emergency Illustration"
        />
      </motion.div>

      {/* Cards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl px-4"
      >
        {emergencyContacts.map((contact, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="h-full"
          >
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 bg-white/90 backdrop-blur-md border border-gray-200">
              <CardHeader className="text-center">
                <Stethoscope className="w-12 h-12 mx-auto text-blue-500" />
                <CardTitle className="text-xl mt-2">{contact.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {contact.role}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-700 h-full px-2">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <p className="break-words">{contact.address}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-white hover:bg-gray-50"
                  onClick={() => window.open(`tel:${contact.phone}`)}
                >
                  <Phone className="w-4 h-4" />
                  <span>{contact.phone}</span>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Emergency;