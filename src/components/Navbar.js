import React, {useState} from "react";
import logo_white from "../assets/images/logo_white.png";
import GitHubIcon from "@material-ui/icons/GitHub";
import AppBar from "@material-ui/core/AppBar";
import axios from 'axios';

export function Navbar(props) {
    const [stars, setStars] = useState("...");
    axios.get("https://api.github.com/repos/datamllab/rlcard")
        .then(res=>{
            setStars(res.data.stargazers_count);
        });
    return (
        <AppBar position="static" className={"header-bar-wrapper"}>
            <div className={"header-bar"}>
                <img src={logo_white} alt={"Logo"} height="65px" />
                <div className={"title unselectable"}><div className={"title-text"}>Showdown<span className={"subtitle"}>/ {props.gameName}</span></div></div>
                <div className={"stretch"} />
                <div className={"github-info"} onClick={()=>{window.location.href = 'https://github.com/datamllab/rlcard'}}>
                    <div className={"github-icon"}><GitHubIcon /></div>
                    <div className={"github-text"}>Github<br /><span>{stars} stars</span></div>
                </div>
            </div>
        </AppBar>
    )
}

export default Navbar;