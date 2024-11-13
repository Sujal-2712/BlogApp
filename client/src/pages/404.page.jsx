import { Link } from "react-router-dom";
import pageNotFoundImage from "../imgs/404.png";
const PageNotFound = () => {
    return (
        <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
                <img src={pageNotFoundImage} alt="" className="select-none border-0 border-grey w-80 aspect-square object-cover rounded" />

                <h1 className="text-4xl font-gelasio leading-7">
                    Page Not Found
                </h1>

                <p className="text-dark-grey text-xl leading-7 -mt-8">Back to the <Link to="/" className="text-black underline">
                Home Page</Link></p>
        </section>
    )
}

export default PageNotFound;