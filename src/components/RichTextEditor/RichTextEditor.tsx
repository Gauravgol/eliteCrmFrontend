import { useState, useRef, useEffect } from "react";
import "./RichTextEditor.css";

interface RichTextEditorProps {
    initialValue: string;
    onSave: (content: string) => void;
    onCancel: () => void;
}

export default function RichTextEditor({
    initialValue,
    onSave,
    onCancel,
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);

    useEffect(() => {
        if (editorRef.current && initialValue) {
            editorRef.current.innerHTML = initialValue;
        }
    }, []);

    const execCommand = (command: string, value: string | null = null) => {
        document.execCommand(command, false, value || undefined);
        editorRef.current?.focus();
    };

    const handleSave = () => {
        const content = editorRef.current?.innerHTML || "";
        onSave(content);
    };

    const handleColorChange = (color: string) => {
        execCommand("foreColor", color);
        setShowColorPicker(false);
    };

    const colors = [
        "#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc",
        "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc",
        "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66",
        "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00",
        "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000",
        "#663d00", "#666600", "#003700", "#002966", "#3d1466"
    ];

    return (
        <div className="rte-container">
            <div className="rte-toolbar">
                {/* Text Formatting */}
                <button
                    type="button"
                    className="rte-btn"
                    onClick={() => execCommand("bold")}
                    title="Bold"
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    className="rte-btn"
                    onClick={() => execCommand("italic")}
                    title="Italic"
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    className="rte-btn"
                    onClick={() => execCommand("underline")}
                    title="Underline"
                >
                    <u>U</u>
                </button>
                <button
                    type="button"
                    className="rte-btn"
                    onClick={() => execCommand("strikeThrough")}
                    title="Strikethrough"
                >
                    <s>S</s>
                </button>

                <div className="rte-divider"></div>

                {/* Lists */}
                <button
                    type="button"
                    className="rte-btn"
                    onClick={() => execCommand("insertUnorderedList")}
                    title="Bullet List"
                >
                    ⦿
                </button>
                <button
                    type="button"
                    className="rte-btn"
                    onClick={() => execCommand("insertOrderedList")}
                    title="Numbered List"
                >
                    ≡
                </button>

                <div className="rte-divider"></div>

                {/* Color Picker */}
                <div className="rte-color-wrapper">
                    <button
                        type="button"
                        className="rte-btn"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        title="Text Color"
                    >
                        🎨
                    </button>
                    {showColorPicker && (
                        <div className="rte-color-picker">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className="rte-color-swatch"
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorChange(color)}
                                    title={color}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="rte-divider"></div>

                {/* Alignment */}
                <button
                    type="button"
                    className="rte-btn"
                    onClick={() => execCommand("justifyLeft")}
                    title="Align Left"
                >
                    ⬅
                </button>
                <button
                    type="button"
                    className="rte-btn"
                    onClick={() => execCommand("justifyCenter")}
                    title="Align Center"
                >
                    ↔
                </button>
                <button
                    type="button"
                    className="rte-btn"
                    onClick={() => execCommand("justifyRight")}
                    title="Align Right"
                >
                    ➡
                </button>
            </div>

            <div
                ref={editorRef}
                className="rte-editor"
                contentEditable
                suppressContentEditableWarning
            />

            <div className="rte-actions">
                <button type="button" className="btn-save" onClick={handleSave}>
                    Save
                </button>
                <button type="button" className="btn-cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
