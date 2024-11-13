import axios from "axios";
import InPageNavigation from "../components/inpage-navigation.component";
import { API_URL } from './../../config';
import { useEffect, useState } from "react";
import Loader from './../components/loader.component';
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreData from "../components/load-more.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
// import { activeTabLineRef } from "../components/inpage-navigation.component"
// import { activeTabRef } from "../components/inpage-navigation.component";
import filterPaginationData from "../common/filter-pagination-data";


const categories = ["Programming", "Hollywood", "Flim Making", "Social Media", "Cooking", "Tech", "Finances", "Sports"];
const HomePage = () => {
    const [blog, setBlog] = useState(null);
    const [trendingBlog, setTrendingBlog] = useState(null);
    const [pageState, setPageState] = useState("home");


    const fetchLatestBlogs = async (page = 1) => {
        try {
            const result = await axios.post(`${API_URL}/latest-blogs`, { page: page });
            let formatData = await filterPaginationData({
                state: blog,
                data: result.data,
                page,
                countRoute: "/all-latest-blogs-count"
            })
            setBlog(formatData);
        } catch (error) {
            console.log(error);
        }
    }

    const fetchTrendingBlogs = async () => {
        try {
            const result = await axios.get(`${API_URL}/trending-blogs`);
            console.log(result);
            setTrendingBlog(result.data);
        } catch (error) {
            console.log(error);
        }
    }
    const loadBlogCategory = (e) => {
        const category = e.target.innerText;
        setBlog(null);
        if (pageState == category) {
            setPageState("home");
            return;
        }
        setPageState(category);
    }
    const fetchBlogsByCategory = async (page = 1) => {
        try {
            const result = await axios.post(`${API_URL}/search-blogs`, {
                tag: pageState,
                page: page
            })
            let formatData = await filterPaginationData({
                state: blog,
                data: result.data,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: {
                    tag: pageState
                }
            })
            setBlog(formatData);
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        if (pageState == "home") {
            fetchLatestBlogs(1);
        } else {
            fetchBlogsByCategory(1);
        }
        if (!trendingBlog) {
            fetchTrendingBlogs();
        }

    }, [pageState]);
    return (
        <>
            <section className="h-cover flex justify-center gap-10">
                <div className="w-full">
                    <InPageNavigation routes={["home", "trending blogs"]} defaultHidden={["trending blogs"]}>
                        <>
                            {
                                blog == null ? <Loader /> :
                                    blog.results.length >0 ?
                                        blog.results.map((item, index) => {
                                            return (<BlogPostCard key={index} content={item} author={item.author.personal_info} />)
                                        }) : <NoDataMessage message={"No Blogs Found!!"} />
                            }
                            <LoadMoreData state={blog} fetchDataFun={pageState=="ome" ? fetchLatestBlogs : fetchBlogsByCategory} />
                        </>
                        <>
                            {
                                trendingBlog == null ? <Loader /> :
                                    trendingBlog.length ?
                                        trendingBlog.map((item, index) => {
                                            return (<MinimalBlogPost key={index} blog={item} index={index} />)
                                        }) : <NoDataMessage message={"No Trending Blogs Found!!"} />
                            }
                        </>
                    </InPageNavigation>
                </div>

                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
                    <div className="flex flex-col gap-5">
                        <h1 className="font-medium text-xl">Stories from all intrests</h1>
                        <div className="flex gap-3 flex-wrap">
                            {
                                categories.map((category, index) => {
                                    return (<button className={"tag " + (pageState == category ? " bg-black text-white" : " ")} onClick={loadBlogCategory} key={index}>{category}</button>)
                                })
                            }
                        </div>
                        <div className="flex flex-col gap-3">
                            <h1 className="font-medium text-xl">Trending <i className="fi fi-rr-arrow-trend-up"></i></h1>
                            {
                                trendingBlog == null ? <Loader /> :
                                    trendingBlog.length ?
                                        trendingBlog.map((item, index) => {
                                            return (<MinimalBlogPost key={index} blog={item} index={index} />)
                                        }) : <NoDataMessage message={"No Trending Blogs Found!!"} />
                            }
                        </div>
                    </div>

                </div>
            </section>
        </>
    )
}

export default HomePage;