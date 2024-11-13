

import React from 'react'
import { Link } from 'react-router-dom';
import {getFullDay} from "./../common/date";
const AboutUser = ({ classname, bio, social_links, joinedAt }) => {
    return (
        <div className={"md:w-[90%] md:mt-7" + classname}>
            <p className='text-xl leading-7 '>{bio.length ? bio : "Nothing to read here"}</p>
            <div className='flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey'>
                {
                    Object.keys(social_links).map((ele) => {
                        let link = social_links[ele];
                        return link ? <Link to={link} key={ele} target='_blank'>
                            <i className={"fi " + (ele != "website" ? "fi-brands-" + ele : "fi-rr-globe")}>
                            </i></Link> : "";
                    })
                }
            </div>

            <p className='text-xl leading-7 text-dark-grey'>Joined On {getFullDay(joinedAt)}</p>
        </div>
    )
}

export default AboutUser
