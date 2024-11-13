

import React, { useContext, useState } from 'react'
import { UserContext } from '../App';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

const NotificationCommentField = ({ _id, blog_author, index = undefined, replyingTo = undefined, setReplying, notification_id,
    notificationData
}) => {

    const [comment, setComment] = useState('');
    let { _id: user_id } = blog_author;
    let { userAuth: { access_token } } = useContext(UserContext);
    let { notifications, notifications: { results }, setNotifications } = notificationData;

    const [loading, setIsLoading] = useState(false);

    const handleComment = async (e) => {
        if (!comment.trim().length) return toast.error("Write something to leave a comment.");

        setIsLoading(true);
        try {
            const result = await axios.post(`${API_URL}/add-comment`, { _id, blog_author: user_id, comment, replying_to: replyingTo, notification_id }, {
                headers: { 'Authorization': `Bearer ${access_token}` }
            });


            setComment("");
            setReplying(false);
            results[index].reply = { comment, _id: result.data._id };
            setNotifications({ ...notifications, results });

            
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit comment.");
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div>

            <textarea value={comment} onChange={(e) => { setComment(e.target.value) }} placeholder='Leave a comment..' className='input-box pl-5'>

                

            </textarea>
            <button className='btn-dark mt-5 px-10' onClick={handleComment}>Comment</button>

        </div>
    )
}

export default NotificationCommentField
