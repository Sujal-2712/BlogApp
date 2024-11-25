import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../App";
import { API_URL } from './../../config';

const PublishForm = () => {
    const navigate = useNavigate();
    const characterLimit = 200;
    const tagLimit = 5;
    const { blog_id } = useParams();
    let { setEditorState, blog, setBlog, blog: { title, banner, content, tags, des } } = useContext(EditorContext);
    let { userAuth: { access_token } } = useContext(UserContext);

    const handleCloseEvent = () => {
        setEditorState("editor");
    }

    const handleBlogTitleChange = (e) => {
        let input = e.target.value;
        setBlog({ ...blog, title: input });
    }

    const handleBlogDesChange = (e) => {
        let input = e.target.value;
        setBlog({ ...blog, des: input });
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            let tag = e.target.value.trim(); // trim whitespace
            if (tags.length < tagLimit) {
                if (!tags.includes(tag) && tag.length) {
                    setBlog({ ...blog, tags: [...tags, tag] });
                }
            } else {
                toast.error("You can add a maximum of 5 Tags");
            }
            e.target.value = "";
        }
    }

    const handlePublish = async (e) => {
        if (!title.length) {
            return toast.error("Title is required!!");
        }
        if (!des.length || des.length > characterLimit) {
            return toast.error(`Write a description within ${characterLimit} characters to publish.`);
        }
        if (!tags.length) {
            return toast.error("Enter at least 1 Tag to publish.");
        }

        let loadingToast = toast.loading("Publishing...");
        try {
            const result = await axios.post(`${API_URL}/create-blog`,
                { title, banner, content, tags, des, draft: false, id: blog_id },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            );
            toast.success("Blog Uploaded!");

            setTimeout(() => [
                navigate("/dashboard/blogs")
            ], 500);
        } catch (error) {
            toast.error("Error Occurred!");
        } finally {
            toast.dismiss(loadingToast);
        }
    }

    return (
        <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
            <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]" onClick={handleCloseEvent}>
                <i className="fi fi-br-cross"></i>
            </button>

            <div className="max-w-[550px] center">
                <p className="text-dark-grey text-2xl mb-1">Preview</p>
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
                    {banner ? <img src={banner} alt="Blog banner" /> : null}
                </div>

                <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">{title}</h1>
                <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">{des}</p>
            </div>

            <div className="border-grey lg:border-1">
                <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
                <input
                    type="text"
                    placeholder="Blog Title"
                    className="input-box pl-4"
                    value={title}
                    onChange={handleBlogTitleChange}
                />

                <p className="text-dark-grey mb-2 mt-9">Short Description about your Blog</p>
                <textarea
                    maxLength={characterLimit}
                    value={des}
                    className="h-40 resize-none leading-7 input-box pl-4"
                    onChange={handleBlogDesChange}
                />
                <p className="text-dark-grey text-sm text-right">{characterLimit - des.length} Characters Left</p>

                <p className="text-dark-grey mb-2 mt-9">Topics - (Helps in searching and ranking your post)</p>
                <div className="relative input-box pl-2 py-2 pb-4">
                    <input
                        type="text"
                        placeholder="Topic"
                        className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
                        onKeyDown={handleKeyDown}
                    />
                    {tags.map((tag, index) => (
                        <Tag tag={tag} key={index} />
                    ))}
                </div>
                <p className="mt-2 mb-4 text-dark-grey text-right text-xs">{tagLimit - tags.length} Tags Left</p>

                <button className="btn-dark px-8" onClick={handlePublish}>Publish</button>
            </div>
        </section>
    );
}

export default PublishForm;
