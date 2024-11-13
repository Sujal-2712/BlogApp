import React, { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { UserContext } from '../App';
import axios from 'axios';
import { API_URL } from '../../config';
import { BlogContext } from '../pages/blog.page';

const CommentsField = ({ action, index = undefined, replyingTo = undefined, setReplying }) => {
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext);
    const { blog, setBlog, blog: { _id, author: { _id: blog_author }, comments, activity }, setTotalParentCommentsLoaded } = useContext(BlogContext);
    const commentArr = comments.results || [];

    const handleComment = async () => {
        if (!access_token) {
            return toast.error("Please login to comment.");2
        }
        if (!comment.trim().length) return toast.error("Write something to leave a comment.");

        setIsLoading(true);
        try {
            const result = await axios.post(`${API_URL}/add-comment`, { _id, blog_author, comment, replying_to: replyingTo }, {
                headers: { 'Authorization': `Bearer ${access_token}` }
            });
            setComment("");

            let newCommentArr;
            if (replyingTo) {
                // Update the existing comment's children
                const parentComment = commentArr[index];
                parentComment.children = parentComment.children || [];
                parentComment.children.push(result.data._id);
                result.data.childrenLevel = parentComment.childrenLevel + 1;
                parentComment.isReplyLoaded = true;

                // Insert the new reply into the array
                newCommentArr = [...commentArr]; // Create a copy of the comment array
                newCommentArr.splice(index + 1, 0, result.data); // Add the reply right after the parent comment
                setReplying(false);
            } else {
                // If it's a top-level comment
                result.data.childrenLevel = 0;
                result.data.commented_by = { personal_info: { username, profile_img, fullname } };
                newCommentArr = [result.data, ...commentArr]; // Add to the top
            }

            // Update the blog state
            setBlog({ ...blog, comments: { ...comments, results: newCommentArr }, activity: { ...activity, total_comments: activity.total_comments + 1 } });

        } catch (error) {
            console.error(error);
            toast.error("Failed to submit comment.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <textarea
                onChange={(e) => setComment(e.target.value)}
                value={comment}
                placeholder='Leave a comment...'
                className='input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto'
            />
            <button
                className={`btn-dark mt-5 px-10 ${isLoading ? 'opacity-50' : ''}`}
                onClick={handleComment}
                disabled={isLoading}
            >
                {isLoading ? 'Submitting...' : action}
            </button>
        </div>
    );
};

export default CommentsField;
