

const InputBox = ({ name, type, id, value, placeholder, disable = false, icon = "fi-rr-user" }) => {
    return (
        <div className="relative w-[100%] mb-5">
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                defaultValue={value}
                id={id}
                className="input-box"
                disabled={disable}
                required
            />
            <i className={"fi " + icon + " input-icon"}></i>
        </div>
    )
}

export default InputBox;