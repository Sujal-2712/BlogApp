import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogContext } from '../pages/blog.page';
import { UserContext } from '../App';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from '../../config';

const BlogInteraction = () => {
    const {
        blog,
        blog: { _id, blog_id, activity, activity: { total_likes = 0, total_comments = 0 } = {}, author: { personal_info: { fullname, username: author_username } } },
        isLikedbyUser,
        setLikedbyUser,
        setBlog,
        setCommentsWrapper,
        commentsWrapper
    } = useContext(BlogContext);

    const { userAuth: { username, access_token } } = useContext(UserContext);
    const navigate = useNavigate();

    const handleEditClick = () => {
        navigate(`/blog/editor/${blog_id}`, { replace: true });
    };

    useEffect(() => {
        if (access_token) {
            axios.post(`${API_URL}/isliked-by-user`, { _id }, {
                headers: { 'Authorization': `Bearer ${access_token}` }
            }).then(({ data: { result } }) => {
                setLikedbyUser(Boolean(result));
            }).catch((err) => {
                console.log(err);
            });
        }
    }, [blog_id]);

    const handleLike = async () => {
        if (access_token) {
            const updatedLikes = isLikedbyUser ? total_likes - 1 : total_likes + 1;
            setBlog({ ...blog, activity: { ...activity, total_likes: updatedLikes } });
            setLikedbyUser(!isLikedbyUser);

            await axios.post(`${API_URL}/like-blog`, { _id, isLikedbyUser }, {
                headers: { 'Authorization': `Bearer ${access_token}` }
            }).then(({ data }) => {
                console.log(data);
            }).catch((error) => {
                console.error("Error liking blog:", error);
            });

        } else {
            toast.error("Please login to like Blog");
        }
    };

    return (
        <div>
            <hr className='border-grey my-2' />
            <div className='flex gap-6 justify-between'>
                <div className='flex gap-3 items-center'>
                    <button onClick={handleLike} className={'w-10 h-10 rounded-full flex items-center justify-center ' + (isLikedbyUser ? "text-red font-extrabold" : "bg-grey/80")}>
                        <i className={'fi ' + (isLikedbyUser ? "fi-sr-heart" : "fi-rr-heart")}></i>
                    </button>
                    <p className='text-xl text-dark-grey'>{total_likes || 0}</p>

                    <button onClick={() => setCommentsWrapper(!commentsWrapper)} className='w-10 h-10 rounded-full flex items-center justify-center bg-grey/80'>
                        <i className='fi fi-rr-comment-dots'></i>
                    </button>
                    <p className='text-xl text-dark-grey'>{total_comments || 0}</p>

                    <div className='flex gap-6 items-center'>
                        {username === author_username && (
                            <button onClick={handleEditClick} className='underline hover:text-purple-30'>Edit</button>
                        )}
                    </div>
                </div>
            </div>
            <hr className='border-grey my-2' />
        </div>
    );
};

export default BlogInteraction;
