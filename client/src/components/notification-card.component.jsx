import { comment } from 'postcss';
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { getDay } from '../common/date';
import { UserContext } from '../App';
import axios from 'axios';
import { API_URL } from '../../config';
import NotificationCommentField from "./notification-comment-field.component"

const NotificationCard = ({ data, index, notificationState }) => {
    // Destructure the notification object and handle missing data
    let [isReplying, setReplying] = useState(false);
    const {
        seen,
        type,
        reply,
        comment,
        blog,
        user,
        replied_on_comment,
        createdAt,
        _id: notification_id
    } = data || {};

    let { userAuth: { access_token, profile_img: author_profile_img, username: author_username } } = useContext(UserContext);

    const { personal_info: { fullname, username, profile_img } = {} } = user || {};
    const { blog_id, title, _id } = blog || {};

    const { notifications, notifications: { results, totalDocs }, setNotifications } = notificationState;

    if (!data) {
        return <div>Error: No notification data available</div>;
    }
    const handleReplyClick = (e) => {
        setReplying(preVal => !preVal)
    }
    const handleDelete = async (comment_id, type, target) => {
        // target.setAttribute("disabled", true)
        try {
            const result = await axios.post(`${API_URL}/delete-comment`, { _id: comment_id }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })

            if (type == "comment") {
                results.splice(index, 1);
            } else {
                delete results[index].reply;
            }

            target.removeAttribute("disabled");
            setNotifications({ ...notifications, results, totalDocs: totalDocs - 1, deleteDocCount: notifications.deleteDocCount + 1 })


        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div className={'p-5 border-b border-gray-300 border-l-black ' + (!seen ? "border-l-2" : "")}>
            <div className='flex gap-5 mb-2'>
                <img
                    src={profile_img || "/path/to/default-profile-image.png"}
                    className='w-14 h-14 flex-none rounded-full'
                    alt={`Profile of ${username || 'User'}`}
                />
                <div className='w-full'>
                    <h1>
                        <Link to={`/user/${username}`} className="mr-2 text-black underline">
                            @{username || 'username'}
                        </Link>
                        <span className='lg:inline-block capitalize font-normal'>
                            {

                                type == "like" ? "Liked your blog" :
                                    type == "comment" ? "commented on" :
                                        type == "reply" ? "replied on" : "unknown type"
                            }
                        </span>
                    </h1>

                    {/* Check for type of notification */}
                    {
                        type === "reply" ? (
                            <div className='p-4 mt-4 rounded-md bg-gray-200'>
                                <p>{replied_on_comment?.comment || "No comment available"}</p>
                            </div>
                        ) : (
                            <Link to={`/blog/${blog_id}`} className="font-medium text-dark-grey hover:underline line-clamp-1 ">{title || "Untitled Blog"}</Link>
                        )
                    }
                </div>
            </div>

            {
                type != "like" ?
                    <p className='ml-14 pl-5 font-gelasio text-xl my-5'>{comment.comment}</p> : ""
            }

            <div className='ml-14 pl-5 mt-3 text-dark-grey flex gap-8'>
                <p>{getDay(createdAt)}</p>
                {
                    type != "like" ? <>
                        {
                            !reply ?
                                <button onClick={handleReplyClick} className='underline hover:text-black'>Reply</button> : ""
                        }
                        <button className='underline hover:text-black' onClick={(e) => {
                            handleDelete(comment._id, "comment", e.target)
                        }}>Delete</button></> : ""
                }
            </div>

            {
                isReplying ? <div className='mt-8'>
                    <NotificationCommentField _id={_id} blog_author={user} index={index} replyingTo={comment._id}
                        setReplying={setReplying} notification_id={notification_id} notificationData={notificationState} />
                </div> : ""
            }

            {
                reply ?
                    <div className='ml-20 p-5 bg-grey mt-5 rounded-md'>
                        <div className='flex gap-3 mb-3'>
                            <img src={author_profile_img} className='w-8 h-8 rounded-full' alt="" />

                            <div>
                                <h1 className='font-medium text-xl text-dark-grey'>
                                    <Link className='mx-1 text-black underline' to={`/user/${author_username}`}>@{author_username}</Link>
                                    <span className='font-normal'>replied to</span>
                                    <Link className='mx-1 text-black underline' to={`/user/${username}`}>@{username}</Link>
                                </h1>
                            </div>
                        </div>
                        <p className='ml-1 font-gelasio text-xl my-2'>{reply?.comment}</p>
                        <button className='underline hover:text-black ml-14' onClick={(e) => {
                            handleDelete(comment._id, "comment", e.target)
                        }}>Delete</button>
                    </div> : ""
            }
        </div>
    );
};

export default NotificationCard;
