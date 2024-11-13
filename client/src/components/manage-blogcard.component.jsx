import React, { useContext, useState } from 'react';
import { getDay } from '../common/date';
import { Link } from 'react-router-dom';
import { UserContext } from '../App';
import axios from 'axios';
import { API_URL } from '../../config';

const BlogStats = ({ stats }) => {

    return (
        <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-grey max-lg:border-b">
            {Object.keys(stats).map((key) => {
                console.log(key, "sujal")
                return (
                    <div key={key} className="flex capitalize p-4 px-6 flex-col items-center w-full h-full justify-center">
                        <h1 className='text-xl lg:text-2xl mb-2'>{stats[key].toLocaleString()}</h1>
                        <p className='max-lg:text-dark-grey'>{key.split("_")[1]}</p>
                    </div>
                );
            })}
        </div>
    );
};

const ManagePublishedBlogCard = ({ blog }) => {
    const { banner, blog_id, title, publishedAt, activity } = blog;
    const [showStat, setShowStat] = useState(false);
    let { userAuth: { access_token } } = useContext(UserContext);

    return (
        <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
            <img
                src={banner}
                className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover"
                alt="Blog Banner"
            />

            <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
                <div>
                    <Link to={`/blog/${blog_id}`} className="blog-title mb-4 hover:underline">
                        {title}
                    </Link>
                    <p className="line-clamp-1">Published on {getDay(publishedAt)}</p>
                </div>

                <div className="flex gap-6 mt-3">
                    <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">
                        Edit
                    </Link>
                    <button onClick={() => setShowStat((prev) => !prev)} className="lg:hidden pr-4 py-2 underline">
                        Stats
                    </button>
                    <button onClick={(e) => { deleteBlog(blog, access_token, e.target) }} className='pr-4 py-2 underline text-red'>Delete</button>
                </div>

                {/* Always render BlogStats component */}
                <div className="max-lg:hidden">
                    <BlogStats stats={activity} />
                </div>
            </div>

            {/* Conditional rendering for stats on mobile */}
            {showStat && (
                <div className="lg:hidden">
                    <BlogStats stats={activity} />
                </div>
            )}
        </div>
    );
};

const deleteBlog = (blog, access_token, target) => {
    let { index, blog_id, setStateFuc } = blog;
    target.setAttribute("disabled", true);
    axios.post(`${API_URL}/delete-blog`, { blog_id }, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    }).then(({ data }) => {
        target.removeAttribute("disabled");
        setStateFuc(preVal => {
            let { deletedDocCount, totalDocs, results } = preVal;
            results.splice(index, 1);
            if (!deletedDocCount) deletedDocCount = 0;
            if (!results.length && totalDocs - 1 > 0) return null;
            return { ...preVal, totalDocs: totalDocs - 1, deletedDocCount: deletedDocCount + 1 }

        })
    }).catch((error) => {
        console.log(error);
    })
}

export const ManageDraftBlogCard = ({ blog }) => {
    let { title, des, blog_id, index } = blog;
    index=index+1;
    let { userAuth: { access_token } } = useContext(UserContext);
    return (
        <div className='flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey '>
            <h1 className='blog-index text-center pl-4 md:pl-6 flex-none'>{index < 10 ? "0" + index : index}</h1>

            <div>
                <h1 className='blog-title mb-3'>{title}</h1>
                <p className='line-clamp-2'>{des.length ? des : "No description"}</p>
                <div className='flex gap-6 mt-3'>
                    <Link to={`/editor/${blog_id}`} className='pr-4 py-2 underline'>Edit</Link>
                    <button onClick={(e) => { deleteBlog(blog, access_token, e.target) }} className='pr-4 py-2 underline text-red'>Delete</button>
                </div>
            </div>
        </div>
    )
}
export default ManagePublishedBlogCard;
