import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
	// minimal, keep styling/props as in your style system
	return <textarea ref={ref} {...props} />;
});

export default Textarea;
