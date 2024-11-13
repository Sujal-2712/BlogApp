import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";

const Tag = ({ tag }) => {
    let { blog, blog: { tags }, setBlog } = useContext(EditorContext);

    const handleDelete = (e) => {
        tags = tags.filter(t => t != tag);
        setBlog({ ...blog, tags }); 
    }
    return (
        <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-12">
            <p className="outline-none" contentEditable="true">{tag}</p>
            <button onClick={handleDelete} className="mt-[2px] rounded-full absolute right-5 top-1/2 -translate-y-1/2">
                <i className="fi fi-br-cross text-xs pointer-events-none"></i>
            </button>
        </div>
    )
}

export default Tag;