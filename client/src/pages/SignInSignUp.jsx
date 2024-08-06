import { useState } from "react"
import { Card, Typography } from "@material-tailwind/react";
import { SignIn } from "../components/SignIn";
import { SignUp } from "../components/SignUp";

const SignInSignUp = () => {
    const [signInStatus, setSignInStatus] = useState(true)
    
    const handleSignIn = () => {
        setSignInStatus(previous => !previous)
    }

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <Card className="w-96 shadow-2xl">
                {signInStatus ?
                    <div>
                        <SignIn />
                        <Typography variant="small" className="text-center mb-4">
                            Don&apos;t have an account ?
                            <span className="font-bold ml-1 cursor-pointer hover:text-black" onClick={handleSignIn}>Sign up</span>
                        </Typography>
                    </div> :
                    <div>
                        <SignUp handleSignIn={handleSignIn} />
                        <Typography variant="small" className="text-center mb-4">
                            Already have an account ?
                            <span className="font-bold ml-1 cursor-pointer hover:text-black" onClick={handleSignIn}>Sign in</span>
                        </Typography>
                    </div>
                }
            </Card>
        </div>
    )
}

export default SignInSignUp