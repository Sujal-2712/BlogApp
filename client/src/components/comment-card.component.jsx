import React, { useContext, useState } from 'react';
import { getDay } from '../common/date';
import { UserContext } from '../App';
import CommentsField from './comment-field.component';
import { BlogContext } from '../pages/blog.page';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from '../../config';

const CommentCard = ({ index, leftVal, commentData }) => {
    const { comment, commented_by, commentedAt, _id, children } = commentData;

    const { setBlog, activity, blog, setTotalParentCommentsLoaded } = useContext(BlogContext);
    const { userAuth: { access_token } } = useContext(UserContext);

    const { total_parent_comments } = activity;
    const { comments: { results: commentArr }, author: { personal_info: { username: blog_author } } } = blog;

    // Check if commented_by is defined and extract properties safely
    let profile_img, fullname, commented_by_username, username
    if (commented_by) {
        const { personal_info } = commented_by;
        profile_img = personal_info?.profile_img;
        fullname = personal_info?.fullname;
        commented_by_username = personal_info?.username;
        username = personal_info?.username
    }

    const [isReplying, setIsReplying] = useState(false);

    const handleReply = () => {
        if (!access_token) {
            return toast.error('Please Login to Reply');
        }
        setIsReplying(!isReplying);
    };

    const getParentIndex = () => {
        let startingPoint = index - 1;
        try {
            while (commentArr[startingPoint].childrenLevel >= commentData.childrenLevel) {
                startingPoint--;
            }
        } catch (error) {
            startingPoint = undefined;
        }
        return startingPoint;
    };

    const removeCommentsCards = (startingPoint, isDelete = false) => {
        if (commentArr[startingPoint]) {
            while (commentArr[startingPoint].childrenLevel > commentData.childrenLevel) {
                commentArr.splice(startingPoint, 1);
                if (!commentArr[startingPoint]) {
                    break;
                }
            }
        }

        if (isDelete) {
            let parentIndex = getParentIndex();
            if (parentIndex !== undefined) {
                commentArr[parentIndex].children = commentArr[parentIndex].children.filter(child => child !== _id);

                if (!commentArr[parentIndex].children.length) {
                    commentArr[parentIndex].isReplyLoaded = false;
                }
            }

            commentArr.splice(index, 1);
        }

        if (commentData.childrenLevel === 0 && isDelete) {
            setTotalParentCommentsLoaded(preVal => preVal - 1);
        }

        setBlog({
            ...blog,
            comments: { results: commentArr },
            activity: {
                ...activity,
                total_parent_comments: total_parent_comments - (commentData.childrenLevel === 0 && isDelete ? 1 : 0)
            }
        });
    };

    const loadReply = ({ skip = 0 }) => {
        if (children.length) {
            hideReplies();
            axios.post(`${API_URL}/get-replies`, { _id, skip })
                .then(({ data: { replies } }) => {
                    commentData.isReplyLoaded = true;
                    replies.forEach((reply, i) => {
                        reply.childrenLevel = commentData.childrenLevel + 1;
                        commentArr.splice(index + 1 + i + skip, 0, reply);
                    });
                    setBlog({ ...blog, comments: { ...blog.comments, results: commentArr } });
                })
                .catch(error => {
                    console.log(error);
                });
        }
    };

    const DeleteComment = (e) => {
        e.target.setAttribute("disabled", true);
        axios.post(`${API_URL}/delete-comment`, { _id }, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        }).then((result) => {
            e.target.removeAttribute("disabled");
            removeCommentsCards(index + 1, true);
        });
    };

    const hideReplies = () => {
        commentData.isReplyLoaded = false;
        removeCommentsCards(index + 1);
    };

    return (
        <div className='w-full' style={{ paddingLeft: `${leftVal * 10}px` }}>
            <div className='my-5 p-4 rounded-md border border-grey'>
                <div className='flex gap-3 items-center mb-8'>
                    {profile_img && <img src={profile_img} className='w-6 h-6 rounded-full' alt="" />}
                    <p className='line-clamp-1'>{fullname} @{commented_by_username}</p>
                    <p className='min-w-fit'>{getDay(commentedAt)}</p>
                </div>
                <p className='font-gelasio text-xl ml-3'>{comment}</p>
                <div className='flex gap-5 items-center mt-5'>
                    {
                        commentData.isReplyLoaded ?
                            <button onClick={hideReplies} className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2'>
                                <i className='fi fi-rs-comment-dots'></i>Hide Reply</button> :
                            <button onClick={loadReply} className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2'>
                                <i className='fi fi-rs-comment-dots'></i>{children.length} Reply</button>
                    }
                    <button className='underline' onClick={handleReply}>Reply</button>
                    {
                        (username === commented_by_username || username === blog_author) && (
                            <button onClick={DeleteComment} className='p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red flex items-center'>
                                <i className='fi fi-rr-trash'></i>
                            </button>
                        )
                    }
                </div>
                {isReplying && (
                    <div className='mt-8'>
                        <CommentsField action={"Reply"} index={index} replyingTo={_id} setReplying={setIsReplying} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentCard;
