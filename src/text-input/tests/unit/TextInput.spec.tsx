const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');

import * as sinon from 'sinon';

import { tsx } from '@dojo/framework/core/vdom';
import Focus from '../../../meta/Focus';
import InputValidity from '@dojo/framework/core/meta/InputValidity';
import assertationTemplate from '@dojo/framework/testing/assertionTemplate';

import Label from '../../../label/index';
import TextInput from '../../index';
import * as css from '../../../theme/default/text-input.m.css';
import {
	compareForId,
	compareId,
	createHarness,
	MockMetaMixin,
	noop,
	stubEvent
} from '../../../common/tests/support/test-helpers';
import HelperText from '../../../helper-text/index';

const harness = createHarness([compareId, compareForId]);

interface States {
	disabled?: boolean;
	required?: boolean;
	readOnly?: boolean;
	valid?: { valid?: boolean; message?: string } | boolean;
}

interface ExpectedOptions {
	label?: boolean;
	inputOverrides?: any;
	states?: States;
	focused?: boolean;
	helperText?: string;
}

const expected = function({
	label = false,
	inputOverrides = {},
	states = {},
	focused = false,
	helperText
}: ExpectedOptions = {}) {
	const { disabled, required, readOnly, valid: validState } = states;
	let valid: boolean | undefined;
	let message: string | undefined;

	if (validState !== undefined && typeof validState !== 'boolean') {
		valid = validState.valid;
		message = validState.message;
	} else {
		valid = validState;
	}

	const helperTextValue = (valid === false && message) || helperText;

	return (
		<div key="root" classes={css.root} role="presentation">
			<div
				key="wrapper"
				classes={[
					css.wrapper,
					disabled ? css.disabled : null,
					focused ? css.focused : null,
					valid === false ? css.invalid : null,
					valid === true ? css.valid : null,
					readOnly ? css.readonly : null,
					required ? css.required : null,
					null,
					null,
					!label ? css.noLabel : null
				]}
				role="presentation"
			>
				{label && (
					<Label
						theme={undefined}
						disabled={disabled}
						valid={valid}
						focused={focused}
						readOnly={readOnly}
						required={required}
						hidden={false}
						forId={''}
						classes={{
							'@dojo/widgets/label': {
								root: [css.label]
							}
						}}
					>
						foo
					</Label>
				)}
				<div key="inputWrapper" classes={css.inputWrapper} role="presentation">
					<input
						aria-invalid={valid === false ? 'true' : null}
						autocomplete={undefined}
						classes={css.input}
						disabled={disabled}
						id={''}
						focus={noop}
						key={'input'}
						max={undefined}
						maxlength={null}
						min={undefined}
						minlength={null}
						name={undefined}
						pattern={undefined}
						placeholder={undefined}
						readOnly={readOnly}
						aria-readonly={readOnly ? 'true' : null}
						required={required}
						step={undefined}
						type="text"
						value={undefined}
						onblur={noop}
						onfocus={noop}
						oninput={noop}
						onkeydown={noop}
						onkeyup={noop}
						onclick={noop}
						onpointerenter={noop}
						onpointerleave={noop}
						{...inputOverrides}
					/>
				</div>
			</div>
			<HelperText
				text={helperTextValue}
				valid={valid}
				classes={undefined}
				theme={undefined}
			/>
		</div>
	);
};

const baseAssertion = assertationTemplate(() => {
	return (
		<div key="root" classes={css.root} role="presentation">
			<div
				key="wrapper"
				role="presentation"
				classes={[css.wrapper, null, null, null, null, null, null, null, null, null]}
			>
				{input()}
			</div>
			<HelperText
				assertion-key="helperText"
				text={undefined}
				valid={undefined}
				classes={undefined}
				theme={undefined}
			/>
		</div>
	);
});

const input = () => (
	<div key="inputWrapper" role="presentation" classes={css.inputWrapper}>
		<input
			key="input"
			classes={css.input}
			id=""
			disabled={undefined}
			aria-invalid={null}
			autocomplete={undefined}
			maxlength={null}
			minlength={null}
			name={undefined}
			placeholder={undefined}
			readOnly={undefined}
			aria-readonly={null}
			required={undefined}
			type="text"
			value={undefined}
			focus={noop}
			pattern={undefined}
			onblur={noop}
			onfocus={noop}
			oninput={noop}
			onkeydown={noop}
			onkeyup={noop}
			onclick={noop}
			onpointerenter={noop}
			onpointerleave={noop}
			min={undefined}
			max={undefined}
			step={undefined}
		/>
	</div>
);

registerSuite('TextInput', {
	tests: {
		'default properties'() {
			const h = harness(() => <TextInput />);
			h.expect(expected);
		},

		'custom properties'() {
			const h = harness(() => (
				<TextInput
					aria={{
						controls: 'foo',
						describedBy: 'bar'
					}}
					widgetId="foo"
					maxLength={50}
					minLength={10}
					name="bar"
					placeholder="baz"
					type="email"
					value="hello world"
				/>
			));

			h.expect(() =>
				expected({
					inputOverrides: {
						'aria-controls': 'foo',
						'aria-describedby': 'bar',
						id: 'foo',
						maxlength: '50',
						minlength: '10',
						name: 'bar',
						placeholder: 'baz',
						type: 'email',
						value: 'hello world'
					}
				})
			);
		},

		label() {
			const h = harness(() => <TextInput label="foo" />);

			h.expect(() => expected({ label: true }));
		},

		pattern: {
			string() {
				const h = harness(() => <TextInput pattern="^foo|bar$" />);

				h.expect(() =>
					expected({
						inputOverrides: {
							pattern: '^foo|bar$'
						}
					})
				);
			},
			regexp() {
				const properties = {
					pattern: /^foo|bar$/
				};
				const h = harness(() => <TextInput {...properties} />);

				h.expect(() =>
					expected({
						inputOverrides: {
							pattern: '^foo|bar$'
						}
					})
				);

				(properties.pattern.compile as any)('^bar|baz$');

				h.expect(() =>
					expected({
						inputOverrides: {
							pattern: '^bar|baz$'
						}
					})
				);

				properties.pattern = /^ham|spam$/;

				h.expect(() =>
					expected({
						inputOverrides: {
							pattern: '^ham|spam$'
						}
					})
				);
			}
		},

		autocomplete: {
			true() {
				const h = harness(() => <TextInput autocomplete />);

				h.expect(() =>
					expected({
						inputOverrides: {
							autocomplete: 'on'
						}
					})
				);
			},
			false() {
				const h = harness(() => <TextInput autocomplete={false} />);

				h.expect(() =>
					expected({
						inputOverrides: {
							autocomplete: 'off'
						}
					})
				);
			},
			string() {
				const h = harness(() => <TextInput autocomplete="name" />);

				h.expect(() =>
					expected({
						inputOverrides: {
							autocomplete: 'name'
						}
					})
				);
			}
		},

		'state classes'() {
			let properties: any = {
				disabled: true,
				readOnly: true,
				required: true,
				valid: true
			};
			const h = harness(() => <TextInput {...properties} />);

			h.expect(() =>
				expected({
					states: properties
				})
			);

			properties = {
				disabled: false,
				readOnly: false,
				required: false,
				valid: false
			};

			h.expect(() =>
				expected({
					states: properties
				})
			);

			properties = {
				disabled: false,
				readOnly: false,
				required: false,
				valid: { valid: false, message: 'test' }
			};

			h.expect(() =>
				expected({
					states: properties
				})
			);
		},

		'focused class'() {
			const mockMeta = sinon.stub();
			const mockFocusGet = sinon.stub().returns({
				active: false,
				containsFocus: true
			});
			mockMeta.withArgs(Focus).returns({
				get: mockFocusGet
			});
			mockMeta.withArgs(InputValidity).returns({
				get: () => ({
					valid: undefined,
					message: ''
				})
			});
			const Input = MockMetaMixin(TextInput, mockMeta);
			const h = harness(() => <Input />);
			h.expect(() => expected({ focused: true }));
		},

		helperText() {
			const helperText = 'test';
			const h = harness(() => <TextInput helperText={helperText} />);

			h.expect(() => expected({ helperText }));
		},

		onValidate() {
			const mockMeta = sinon.stub();
			let validateSpy = sinon.spy();

			mockMeta.withArgs(InputValidity).returns({
				get: sinon.stub().returns({ valid: false, message: 'test' })
			});

			mockMeta.withArgs(Focus).returns({
				get: () => ({ active: false, containsFocus: false })
			});

			const Input = MockMetaMixin(TextInput, mockMeta);

			harness(() => <Input value="test value" onValidate={validateSpy} />);

			assert.isTrue(validateSpy.calledWith(false, 'test'));

			mockMeta.withArgs(InputValidity).returns({
				get: sinon.stub().returns({ valid: true, message: '' })
			});

			harness(() => <Input value="test value" onValidate={validateSpy} />);

			assert.isTrue(validateSpy.calledWith(true, ''));
		},

		'onValidate only called when validity or message changed'() {
			const mockMeta = sinon.stub();
			let validateSpy = sinon.spy();

			mockMeta.withArgs(InputValidity).returns({
				get: sinon.stub().returns({ valid: false, message: 'test' })
			});

			mockMeta.withArgs(Focus).returns({
				get: () => ({ active: false, containsFocus: false })
			});

			const Input = MockMetaMixin(TextInput, mockMeta);
			harness(() => (
				<Input
					value="test value"
					valid={{ valid: false, message: 'test' }}
					onValidate={validateSpy}
				/>
			));

			assert.isFalse(validateSpy.called);
		},

		'customValidator not called when native validation fails'() {
			const mockMeta = sinon.stub();
			let validateSpy = sinon.spy();
			let customValidatorSpy = sinon.spy();

			mockMeta.withArgs(InputValidity).returns({
				get: sinon.stub().returns({ valid: false, message: 'test' })
			});

			mockMeta.withArgs(Focus).returns({
				get: () => ({ active: false, containsFocus: false })
			});

			const Input = MockMetaMixin(TextInput, mockMeta);
			harness(() => (
				<Input
					value="test value"
					onValidate={validateSpy}
					customValidator={customValidatorSpy}
				/>
			));

			assert.isFalse(customValidatorSpy.called);
		},

		'customValidator called when native validation succeeds'() {
			const mockMeta = sinon.stub();
			let validateSpy = sinon.spy();
			let customValidatorSpy = sinon.spy();

			mockMeta.withArgs(InputValidity).returns({
				get: sinon.stub().returns({ valid: true })
			});

			mockMeta.withArgs(Focus).returns({
				get: () => ({ active: false, containsFocus: false })
			});

			const Input = MockMetaMixin(TextInput, mockMeta);
			harness(() => (
				<Input
					value="test value"
					onValidate={validateSpy}
					customValidator={customValidatorSpy}
				/>
			));

			assert.isTrue(customValidatorSpy.called);
		},

		'customValidator can change the validation outcome'() {
			const mockMeta = sinon.stub();
			let validateSpy = sinon.spy();
			let customValidatorSpy = sinon
				.stub()
				.returns({ valid: false, message: 'custom message' });

			mockMeta.withArgs(InputValidity).returns({
				get: sinon.stub().returns({ valid: true })
			});

			mockMeta.withArgs(Focus).returns({
				get: () => ({ active: false, containsFocus: false })
			});

			const Input = MockMetaMixin(TextInput, mockMeta);
			harness(() => (
				<Input
					value="test value"
					onValidate={validateSpy}
					customValidator={customValidatorSpy}
				/>
			));

			assert.isTrue(validateSpy.calledWith(false, 'custom message'));
		},

		'leading property'() {
			const leading = () => <span>A</span>;
			const leadingTemplate = baseAssertion
				.setProperty('@wrapper', 'classes', [
					css.wrapper,
					null,
					null,
					null,
					null,
					null,
					null,
					css.hasLeading,
					null,
					css.noLabel
				])
				.prepend('@inputWrapper', () => [
					<span key="leading" classes={css.leading}>
						{leading()}
					</span>
				]);
			const h = harness(() => <TextInput leading={leading} />);
			h.expect(leadingTemplate);
		},

		'trailing property'() {
			const trailing = () => <span>Z</span>;
			const trailingTemplate = baseAssertion
				.setProperty('@wrapper', 'classes', [
					css.wrapper,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					css.hasTrailing,
					css.noLabel
				])
				.append('@inputWrapper', () => [
					<span key="trailing" classes={css.trailing}>
						{trailing()}
					</span>
				]);
			const h = harness(() => <TextInput trailing={trailing} />);
			h.expect(trailingTemplate);
		},

		events() {
			const onBlur = sinon.stub();
			const onFocus = sinon.stub();
			const onValue = sinon.stub();
			const onKey = sinon.stub();

			const h = harness(() => (
				<TextInput onBlur={onBlur} onFocus={onFocus} onValue={onValue} onKeyDown={onKey} />
			));

			h.trigger('@input', 'onblur', stubEvent);
			assert.isTrue(onBlur.called, 'onBlur called');
			h.trigger('@input', 'onfocus', stubEvent);
			assert.isTrue(onFocus.called, 'onFocus called');
			h.trigger('@input', 'oninput', stubEvent);
			assert.isTrue(onValue.called, 'onValue called');
			h.trigger('@input', 'onkeydown', stubEvent);
			assert.isTrue(onKey.called, 'onKey called');
			h.trigger('@input', 'onkeypress', stubEvent);
		},

		'handles value changes from outside the DOM'() {
			const clock = sinon.useFakeTimers();
			let editedValues: undefined | { required: string } = undefined;
			let values = { required: 'Initial' };
			let validity:
				| boolean
				| {
						valid?: boolean | undefined;
						message?: string | undefined;
				  }
				| undefined;

			const mockMeta = sinon.stub();

			const inputValidity = new InputValidity({
				invalidate: () => {},
				nodeHandler: {} as any,
				bind: {} as any
			});

			mockMeta.withArgs(InputValidity).returns({
				getNode: () => undefined,
				get: inputValidity.get,
				invalidate: () => {}
			});
			mockMeta.withArgs(Focus).returns({
				get: () => ({ active: false, containsFocus: false })
			});
			let placeholder: string | undefined;
			const Input = MockMetaMixin(TextInput, mockMeta);
			const h = harness(() => (
				<Input
					widgetId="required"
					required={true}
					onValue={(value) => {
						editedValues = {
							...values,
							...editedValues,
							required: value as string
						};
					}}
					value={editedValues ? editedValues.required : values.required}
					valid={validity}
					onValidate={(valid, message) => (validity = { valid, message })}
					placeholder={placeholder}
				/>
			));

			let assertion = baseAssertion
				.setProperty('@wrapper', 'classes', [
					css.wrapper,
					null,
					null,
					null,
					null,
					null,
					css.required,
					null,
					null,
					css.noLabel
				])
				.setProperty('@input', 'required', true)
				.setProperty('@input', 'value', 'Initial');
			h.expect(assertion);

			h.trigger('@input', 'oninput', { ...stubEvent, ...{ target: { value: '' } } });
			const invalidateMock = sinon.mock();
			mockMeta.withArgs(InputValidity).returns({
				getNode: () => ({
					value: '',
					validity: {
						valid: false
					},
					validationMessage: 'Please fill out this field.'
				}),
				get: inputValidity.get,
				invalidate: invalidateMock
			});
			h.expect(assertion.setProperty('@input', 'value', ''));

			const invalidAssertion = assertion
				.setProperty('@wrapper', 'classes', [
					css.wrapper,
					null,
					null,
					css.invalid,
					null,
					null,
					css.required,
					null,
					null,
					css.noLabel
				])
				.setProperty('@input', 'aria-invalid', 'true')
				.setProperty('~helperText', 'text', 'Please fill out this field.')
				.setProperty('~helperText', 'valid', false)
				.setProperty('@input', 'value', '');
			h.expect(invalidAssertion);

			editedValues = undefined;
			h.expect(invalidAssertion.setProperty('@input', 'value', 'Initial'));

			assert.isTrue(invalidateMock.notCalled, 'Invalidate should not yet have been called');
			clock.tick(1);
			assert.isTrue(invalidateMock.called, 'Invalidate should be called one tick later');

			mockMeta.withArgs(InputValidity).returns({
				getNode: () => ({
					value: 'Initial',
					validity: {
						valid: true
					},
					validationMessage: ''
				}),
				get: inputValidity.get,
				invalidate: () => {}
			});
			placeholder = ''; // Force render
			h.expect(
				invalidAssertion
					.setProperty('@input', 'value', 'Initial')
					.setProperty('@input', 'placeholder', '')
			);

			placeholder = undefined;
			assert.deepEqual(validity, { valid: true, message: '' }, 'Input should be valid');
			h.expect(
				assertion
					.setProperty('@wrapper', 'classes', [
						css.wrapper,
						null,
						null,
						null,
						css.valid,
						null,
						css.required,
						null,
						null,
						css.noLabel
					])
					.setProperty('~helperText', 'valid', true)
			);
			clock.restore();
		}
	}
});
