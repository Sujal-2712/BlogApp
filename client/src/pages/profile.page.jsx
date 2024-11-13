import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from './../../config';
import Loader from "../components/loader.component";
import { Link } from "react-router-dom";
import BlogPostCard from "../components/blog-post.component";
import AboutUser from "../components/about.component";
import LoadMoreData from "../components/load-more.component";
import { UserContext } from "../App";
import filterPaginationData from "../common/filter-pagination-data";
import NoDataMessage from "../components/nodata.component";
import InPageNavigation from "../components/inpage-navigation.component";
import PageNotFound from "./404.page";

export const ProfileData = {
    personal_info: {
        fullname: "",
        username: "",
        profile_img: "",
        bio: ""
    },
    account_info: {
        total_posts: 0,
        total_reads: 0
    },
    social_links: {},
    joinedAt: ""
}

const ProfilePage = () => {
    const { id: profileID } = useParams();
    const [profile, setProfile] = useState(ProfileData);
    const [loading, setLoading] = useState(true);
    const [blog, setBlogs] = useState(null);

    let { userAuth: {
        username
    } } = useContext(UserContext);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const result = await axios.post(`${API_URL}/get-profile`, {
                username: profileID
            });2

            
            if (result.data != null) {
                setProfile(result.data);
                getBlogs({ user_id: result.data._id })
            }
            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    }

    const getBlogs = async ({ page = 1, user_id }) => {
        try {
            // Use a local variable to avoid reassigning the function parameter
            const currentUserId = user_id ?? blog?.user_id;
            const { data } = await axios.post(`${API_URL}/search-blogs`, {
                author: currentUserId,
                page,
            });
            const formattedData = await filterPaginationData({
                state: blog,
                data: data,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { author: currentUserId },
            });

            formattedData.user_id = currentUserId;
            setBlogs(formattedData);
        } catch (error) {
            console.error("Error fetching blogs:", error);
        }
    };



    const { personal_info: { fullname, username: profile_username, profile_img, bio }, account_info: { total_reads, total_posts }, social_links, joinedAt } = profile;

    useEffect(() => {
        setProfile(ProfileData)
        fetchProfile();
    }, [profileID])
    return (
        <section>
            {
                loading ? <Loader /> : profile_username.length ?
                    <div className="h-cover md:flex flex-row-reverse items-start  gap-5 min-[1100px]:gap-12">

                        <div className="flex flex-col max-md:items-center gap-5 max-[250px] min-w-[25%] md:border-1 md:border-grey md:sticky ">

                            <img src={profile_img} alt="" className="w-48 h-48 rounded-full" />

                            <h1 className="text-2xl font-medium ">@{profile_username}</h1>

                            <p className="text-xl capitalize h-6">{fullname}</p>

                            <p>{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads
                            </p>

                            <div className="flex gap-4 mt-2">
                                {
                                    profileID == username ? <Link to="/settings/edit-profile" className="btn-light rounded-md">
                                        Edit Profile
                                    </Link> : ""
                                }

                            </div>

                            <AboutUser className="max-md:hidden" bio={bio} social_links={social_links} joinedAt={joinedAt} />
                        </div>

                        <div className="max-md:mt-12 w-full">
                            <InPageNavigation routes={["Blogs Published", "About"]} defaultHidden={["About"]}>
                                <>
                                    {
                                        blog == null ? <Loader /> :
                                            blog.results.length > 0 ?
                                                blog.results.map((item, index) => {
                                                    return (<BlogPostCard key={index} content={item} author={item.author.personal_info} />)
                                                }) : <NoDataMessage message={"No Blogs Found!!"} />
                                    }
                                    <LoadMoreData state={blog} fetchDataFun={getBlogs} />
                                </>
                                <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />
                            </InPageNavigation>
                        </div>

                    </div> : <PageNotFound />

            }
        </section>
    )
}

export default ProfilePage;