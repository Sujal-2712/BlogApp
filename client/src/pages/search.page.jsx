import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import Loader from "../components/loader.component";
import filterPaginationData from "../common/filter-pagination-data";
import BlogPostCard from "../components/blog-post.component";
import UserCard from "../components/usercard.component";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import LoadMoreData from "../components/load-more.component";

const SearchPage = () => {
    const { query } = useParams();
    let [blog, setBlog] = useState(null);
    let [user, setUsers] = useState(null);

    const fetchUsers = async () => {
        try {
            const result = await axios.post(`${API_URL}/search-users`, { query });
            setUsers(result.data);
        } catch (error) {
            console.log(error);
        }
    }

    const searchBlogs = async (page = 1, create_new_arr = false) => {
        try {
            const result = await axios.post(`${API_URL}/search-blogs`, {
                query, page
            });
            let formatData = await filterPaginationData({
                state: blog,
                data: result.data,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { query },
                create_new_arr // control whether to replace or append data
            });
            console.log(formatData);
            setBlog(formatData);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        setUsers(null);
        setBlog(null);
        searchBlogs(1, true); // Setting create_new_arr to true to clear the old data
        fetchUsers();
    }, [query]);

    const UserCardWrapper = () => {
        return (<>
            {
                user == null ? <Loader /> : user.length ? user.map((ele, index) => {
                    return (
                        <UserCard user={ele} />
                    )
                }) : <NoDataMessage message={"No Users Found"} />
            }
        </>)
    }

    return (
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full">
                <InPageNavigation routes={[`Search Result from "${query}"`, "Accounts Matched"]}>
                    <>
                        {
                            blog == null ? <Loader /> :
                                blog.results.length ?
                                    blog.results.map((item, index) => {
                                        return (<BlogPostCard key={index} content={item} author={item.author.personal_info} />)
                                    }) : <NoDataMessage message={"No Blogs Found!!"} />
                        }
                        <LoadMoreData state={blog} fetchDataFun={searchBlogs} />
                    </>

                    <>
                        <UserCardWrapper />
                    </>
                </InPageNavigation>
            </div>
        </section>
    );
}

export default SearchPage;
