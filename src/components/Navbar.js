import React from "react";
import { Link } from 'react-router-dom';
import logo_white from "../assets/images/logo_white.png";
import GitHubIcon from "@material-ui/icons/GitHub";
import AppBar from "@material-ui/core/AppBar";
import axios from 'axios';

class Navbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {stars: '...'};
    }

    componentDidMount() {
        axios.get("https://api.github.com/repos/datamllab/rlcard")
            .then(res=>{
                this.setState({stars: res.data.stargazers_count});
            });
    }

    render() {
        return (
            <AppBar position="static" className={"header-bar-wrapper"}>
                <div className={"header-bar"}>
                    <Link to="/leaderboard"><img src={logo_white} alt={"Logo"} height="65px" /></Link>
                    <div className={"title unselectable"}><div className={"title-text"}>Showdown<span className={"subtitle"}>{this.props.gameName === '' ? '' : '/ ' + this.props.gameName}</span></div></div>
                    <div className={"stretch"} />
                    <div className={"github-info"} onClick={()=>{window.location.href = 'https://github.com/datamllab/rlcard'}}>
                        <div className={"github-icon"}><GitHubIcon /></div>
                        <div className={"github-text"}>Github<br /><span>{this.state.stars} stars</span></div>
                    </div>
                </div>
            </AppBar>
        )
    }
}

export default Navbar;
