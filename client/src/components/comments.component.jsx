

import React, { useContext } from 'react'
import CommentsField from './comment-field.component';
import { BlogContext } from '../pages/blog.page'
import axios from 'axios';
import { API_URL } from '../../config';
import CommentCard from './comment-card.component';
import NoDataMessage from './nodata.component';

export const fetchComments = async ({ skip = 0, blog_id, setParentCommentCountFun, comment_array }) => {
    try {
        let res;
        const result = await axios.post(`${API_URL}/get-blog-comments`, {
            blog_id, skip
        })
        console.log(result.data);
        result.data.map((comment) => {
            comment.childrenLevel = 0;
        })

        setParentCommentCountFun(preVal => preVal + result.data.length);
        if (comment_array == null) {
            res = { results: result.data };
        } else {
            res = { results: [...comment_array, ...result.data] };
        }

        return res;
    } catch (error) {
        console.log(error);
    }
}

const CommentsContainer = () => {
    const { commentsWrapper, setCommentsWrapper, blog, setBlog, blog: { _id, title, comments: { results: commentArr }, activity: {
        total_parent_comments
    } }, totalParentCommentsLoaded, setTotalParentCommentsLoaded } = useContext(BlogContext);

    const loadMoreComments = async () => {
        let newCommentArr = await fetchComments({
            skip: totalParentCommentsLoaded, blog_id: _id,
            setParentCommentCountFun: setTotalParentCommentsLoaded,
            comment_array: commentArr
        });
        console.log(newCommentArr);
        setBlog({ ...blog, comments: newCommentArr })
    }


    return (
        <div className={"max-sm:w-full fixed " + (commentsWrapper ? "top-0 sm:right-0 " : "top-[100%] sm:right-[-100%] ") + "duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden"}>
            <div className='relative'>
                <h1 className='text-xl font-medium'>Comments</h1>
                <p className='text-lg mt-2 w-[70%] text-dark-grey line-clamp-1'>{title}</p>

                <button onClick={() => {
                    setCommentsWrapper(!commentsWrapper);
                }} className='absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey'>
                    <i className='fi fi-br-cross text-2xl mt-1'></i>
                </button>

                <hr className='border-grey mt-8 w-[120%] -ml-10' />

                <CommentsField action={"Comment"}></CommentsField>

                {
                    commentArr && commentArr.length ?
                        commentArr.map((comment, index) => {
                            return <CommentCard index={index} leftVal={comment.childrenLevel * 4} commentData={comment} />
                        }) : <NoDataMessage message={"No Comments"} />
                }

                {

                    total_parent_comments > totalParentCommentsLoaded ?
                        <button onClick={loadMoreComments}>Load More</button> : ""
                }
            </div>
        </div>
    )
}

export default CommentsContainer
