import React, { createContext, useEffect, useState } from 'react';
import { Link, useAsyncError, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import Loader from '../components/loader.component';
import { getDay } from '../common/date';
import BlogInteraction from '../components/blog-interaction.component';
import BlogPostCard from '../components/blog-post.component';
import BlogContent from '../components/blog-content.component';
import CommentsContainer from '../components/comments.component';
import { fetchComments } from '../components/comments.component';
import { useContext } from 'react';
import { UserContext } from '../App';

// Create a context for the blog
export const BlogContext = createContext({});

const BlogPage = () => {
    const { blog_id } = useParams();
    let [blog, setBlog] = useState(null);
    const [similarBlogs, setSimilarBlogs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLikedbyUser, setLikedbyUser] = useState(false);
    const [commentsWrapper, setCommentsWrapper] = useState(true);
    const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);


    const fetchBlogs = async () => {
        setLoading(true);
        try {
            let blogResponse = await axios.post(`${API_URL}/get-blog`, { blog_id });
            const initialBlog = blogResponse.data.result || {};
            setBlog(initialBlog);

            if (initialBlog._id) {
                initialBlog.comments = await fetchComments({
                    blog_id: initialBlog._id,
                    setParentCommentCountFun: setTotalParentCommentsLoaded
                });
            }
            const similarBlogsResponse = await axios.post(`${API_URL}/search-blogs`, {
                tag: initialBlog.tags?.[0],
                limit: 6,
                eliminate_blog: blog_id
            });
            setSimilarBlogs(similarBlogsResponse.data.result);
        } catch (error) {
            console.error("Error fetching blog data:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        setBlog(null);
        setSimilarBlogs(null);
        setLikedbyUser(false);
        setCommentsWrapper(false);
        setTotalParentCommentsLoaded(0);
        fetchBlogs();
    }, [blog_id]);

    if (loading) {
        return <Loader />;
    }

    if (!blog) {
        return <div>No blog found.</div>;
    }

    const {
        _id,
        title,
        content,
        banner,
        author,
        activity,
        author: {
            personal_info: { fullname, username: author_username, profile_img } = {}
        } = {},
        publishedAt,
        tags
    } = blog;

    const { userAuth: { username } } = useContext(UserContext)

    return (
        <BlogContext.Provider value={{ _id, blog, author, activity, setBlog, isLikedbyUser, setLikedbyUser, setCommentsWrapper, commentsWrapper, setTotalParentCommentsLoaded, totalParentCommentsLoaded }}>
            <CommentsContainer />
            <div className='max-w-[900px] center py-10 max-lg:px-[5vw]'>
                <img src={banner} alt={title} className='aspect-auto' />

                <div className='mt-12'>
                    <h2>{title}</h2>
                    <div className='flex max-sm:flex-col justify-between my-8'>
                        <div className='flex gap-5 items-start'>
                            <img src={profile_img} alt={fullname} className='w-12 h-12 rounded-full' />
                            <p className='capitalize'>
                                {fullname} <br /> @
                                <Link to={`/user/${author_username}`} className='underline'>{author_username}</Link>
                            </p>
                        </div>
                        <p className='text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5'>
                            Published on {getDay(publishedAt)}
                        </p>
                    </div>
                </div>

                <BlogInteraction />

                <div className='my-12 font-gelasio blog-page-content'>
                    {
                        content[0].blocks.map((block, index) => {
                            return <div key={index} className='my-4 md:my-8'>
                                <BlogContent block={block}></BlogContent>
                            </div>
                        })
                    }
                </div>

                {/* <BlogInteraction /> */}

                {similarBlogs && similarBlogs.length > 0 && (
                    <div>
                        <h3 className='text-2xl mt-14 mb-10 font-medium'>Similar Blogs</h3>

                        {
                            similarBlogs.map((blog, index) => {
                                let { author: { personal_info } } = blog;
                                return <BlogPostCard key={index} content={blog} author={personal_info} />
                            })
                        }

                    </div>
                )}
            </div>
        </BlogContext.Provider>
    );
};

export default BlogPage;
