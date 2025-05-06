import * as React from 'react';
import classNames from 'classnames';

import { getComponent } from '../../components-registry';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import SubmitButtonFormControl from './SubmitButtonFormControl';
import { useState } from 'react';

function encode(data) {
    return Object.keys(data)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&')
}

export default function FormBlock(props) {
    const formRef = React.createRef<HTMLFormElement>();
    const { fields = [], elementId, submitButton, className, styles = {}, 'data-sb-field-path': fieldPath } = props;

    if (fields.length === 0) {
        return null;
    }

    const [submitted, setSubmitted] = useState(false);
    const [state, setState] = useState({})

    const handleChange = (event) => {
        setState({ ...state, [event.target.name]: event.target.value })
    }

    function handleSubmit(event) {
       event.preventDefault();

        // const data = new FormData(formRef.current);
        // const value = Object.fromEntries(data.entries());
        // alert(`Form data: ${JSON.stringify(value)}`);

        const form = event.target
        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: encode({
                'form-name': form.getAttribute('name'),
                ...state,
            }),
        })
            .then(() => console.log("Success!"))
            .catch(error => console.log(error));

        event.preventDefault();
        setSubmitted(true);
    }

    return (
        <div>
            { (!submitted) && <form 
                className={classNames(
                    'sb-component',
                    'sb-component-block',
                    'sb-component-form-block',
                    className,
                    styles?.self?.margin ? mapStyles({ margin: styles?.self?.margin }) : undefined,
                    styles?.self?.padding ? mapStyles({ padding: styles?.self?.padding }) : undefined,
                    styles?.self?.borderWidth && styles?.self?.borderWidth !== 0 && styles?.self?.borderStyle !== 'none'
                        ? mapStyles({
                            borderWidth: styles?.self?.borderWidth,
                            borderStyle: styles?.self?.borderStyle,
                            borderColor: styles?.self?.borderColor ?? 'border-primary'
                        })
                        : undefined,
                    styles?.self?.borderRadius ? mapStyles({ borderRadius: styles?.self?.borderRadius }) : undefined
                )}
                name={elementId}
                id={elementId}
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                ref={formRef}
                data-sb-field-path= {fieldPath}
            >
                <div
                    className={classNames('w-full', 'flex', 'flex-wrap', 'gap-8', mapStyles({ justifyContent: styles?.self?.justifyContent ?? 'flex-start' }))}
                    {...(fieldPath && { 'data-sb-field-path': '.fields' })}
                >
                    <input type="hidden" name="form-name" value={elementId} />
                    <p hidden>
                        <label>
                            Don’t fill this out: <input name="bot-field" onChange={handleChange} />
                        </label>
                    </p>
                    {fields.map((field, index) => {
                        const modelName = field.__metadata.modelName;
                        if (!modelName) {
                            throw new Error(`form field does not have the 'modelName' property`);
                        }
                        const FormControl = getComponent(modelName);
                        if (!FormControl) {
                            throw new Error(`no component matching the form field model name: ${modelName}`);
                        }
                        return <FormControl key={index} {...field} {...(fieldPath && { 'data-sb-field-path': `.${index}` })} />;
                    })}
                </div>
                {submitButton && (
                    <div className={classNames('mt-8', 'flex', mapStyles({ justifyContent: styles?.self?.justifyContent ?? 'flex-start' }))}>
                        <SubmitButtonFormControl {...submitButton} {...(fieldPath && { 'data-sb-field-path': '.submitButton' })} />
                    </div>
                )}
            </form>
            }
        </div>
    );
}
