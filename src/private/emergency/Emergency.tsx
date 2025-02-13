import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Emergency = () => {
  return (
    <div className="min-h-[84svh] flex flex-col items-center justify-center gap-8 max-lg:min-h-[93svh]">
      <div className="flex items-center justify-center">
        <img
          src="/emergencyBg.png"
          className="w-[60%]"
          alt="emergency png"
        />
      </div>

      <div className="max-lg:py-4 flex items-center px-4 justify-center gap-8 max-lg:min-w-[100%] max-lg:flex-col  max-lg:min-h-[90%] max-lg:gap-6">
        <Card className="hover:-translate-y-1 transition ease-in duration-200 items-center text-center flex flex-col justify-center bg-slate-200 shadow-xl max-lg:w-[90%]">
          <CardHeader>
            <CardTitle>Dr. Sanjay Gusai</CardTitle>
            <CardDescription>Nurse (Bidholi Campus)</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Basement, Block-5, UPES, Bidholi, Dehradun, Uttarakhand, 248007
            </p>
          </CardContent>
          <CardFooter>
            <p>+91 7500201816</p>
          </CardFooter>
        </Card>
        <Card className="hover:-translate-y-1 transition ease-in duration-200 items-center text-center flex flex-col justify-center bg-slate-200 shadow-xl max-lg:w-[90%]">
          <CardHeader>
            <CardTitle>Dr. Shweta Panwar</CardTitle>
            <CardDescription>Nurse (Bidholi Campus)</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Basement, Block-5, UPES, Bidholi, Dehradun, Uttarakhand, 248007
            </p>
          </CardContent>
          <CardFooter>
            <p>+91 8171323285</p>
          </CardFooter>
        </Card>
        <Card className="hover:-translate-y-1 transition ease-in duration-200 items-center text-center flex flex-col justify-center bg-slate-200 shadow-xl max-lg:w-[90%]">
          <CardHeader>
            <CardTitle>Dr. Riya Godiyal</CardTitle>
            <CardDescription>Nurse (Kandoli Campus)</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Behind Kandoli Boys Hostel, Tower-1, UPES, Kandoli, Dehradun,
              Uttarakhand, 248007
            </p>
          </CardContent>
          <CardFooter>
            <p>+91 9193540530</p>
          </CardFooter>
        </Card>
        <Card className="hover:-translate-y-1 transition ease-in duration-200 items-center text-center flex flex-col justify-center bg-slate-200 shadow-xl max-lg:w-[90%]">
          <CardHeader>
            <CardTitle>Dr. Manglesh Kanswal</CardTitle>
            <CardDescription>Nurse (Kandoli Campus)</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Behind Kandoli Boys Hostel, Tower-1, UPES, Kandoli, Dehradun,
              Uttarakhand, 248007
            </p>
          </CardContent>
          <CardFooter>
            <p>+91 8979840846</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Emergency;
