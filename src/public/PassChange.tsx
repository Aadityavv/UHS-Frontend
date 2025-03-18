import Shared from "@/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ChangeEventHandler, useState } from "react";
import { useNavigate } from "react-router-dom";

const PassChange = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [input, setInput] = useState({ newPass: "", repeatPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);

    const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        const { id, value } = e.target;
        setInput((prev) => ({ ...prev, [id]: value }));
    };

    const handlePassChange = async () => {
        const code = new URLSearchParams(window.location.search).get("code");
        const role = new URLSearchParams(window.location.search).get("role");
        if(!(code&&role)){
            toast({
                variant:"destructive",
                title:"Invalid Request",
                description:"The password Change Request is invalid"
            });
        }
        
        try{

            const response = await axios.post(`https://uhs-backend.onrender.com/api/auth/passwordChange?code=${code}&role=${role}`,input)
            console.log(response.status)
            if(response.status === 200){
                toast({
                    variant:"default",
                    title:"Password Change Successfull",
                    description:response.data
                })
                navigate("/");
                return;
            }else{
                toast({
                    variant:"destructive",
                    title:"Password Change UnSuccessfull",
                    description:response.data.message
                })
                return;
            }
        }catch(err:any){
            toast({
                variant:"destructive",
                title:"Password Change UnSuccessfull",
                description:err.response.data.message
            })
        }

    }


    return (
        <>
          <Toaster />
          <div className="sign-container">
            <div className="sign-container__left"></div>
            <div className="sign-container__right">
              <div className="sign-container__right-content">
                <img src="/upes-logo.jpg" alt="UPES Logo" />
                <h1 className="text-2xl font-medium pb-3 whitespace-nowrap">
                  Welcome To UPES UHS
                </h1>
                <div className="sign-container__right-header">
                  <h1>Password Change</h1>
                </div>
                <form>
                <div>
                <Label htmlFor="newPass">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="newPass"
                    placeholder="New Password"
                    value={input.newPass}
                    onChange={onInputChange}
                    className="bg-white text-black pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? Shared.Eye : Shared.SlashEye}
                  </button>
                </div>
              </div>
    
              <div>
                <Label htmlFor="repeatPassword">Repeat Password</Label>
                <div className="relative">
                  <Input
                    type={showRepeatPassword ? "text" : "password"}
                    id="repeatPassword"
                    placeholder="Repeat Password"
                    value={input.repeatPassword}
                    onChange={onInputChange}
                    className="bg-white text-black pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                    aria-label="Toggle password visibility"
                  >
                    {showRepeatPassword ? Shared.Eye : Shared.SlashEye}
                  </button>
                </div>
              </div>
                </form>
    
                <div className="gap-5 flex flex-col w-full">
                  <Button className="sign-in-btn" onClick={handlePassChange}>
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center w-full border-t border-black bg-white text-black min-h-[8svh] max-lg:hidden">
            <b>Energy Acres, Bidholi : </b>&nbsp;+91-7500201816, +91-8171323285
            &nbsp; | &nbsp; <b>Knowledge Acres, Kandoli : </b>
            &nbsp;+91-8171979021, +91-7060111775
          </div>
        </>
      );

}

export default PassChange;