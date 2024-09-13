const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    let formElement = $(options.form);
    let submitButton = formElement.querySelector(".form-submit");

    let selectorRules = {};

    function validate(inputElement, rule) {
        let errorMessage;
        let errorElement = getParent(
            inputElement,
            options.formGroupSelector
        ).querySelector(options.errorSelector);

        // Lấy ra các rules của selector
        let rules = selectorRules[rule.selector];
        // Lặp qua từng rule & kiểm tra
        for (let i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value);
            // Nếu có lỗi thì dừng việc kiểm tra
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.textContent = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add(
                "invalid"
            );
        } else {
            errorElement.textContent = "";
            getParent(inputElement, options.formGroupSelector).classList.remove(
                "invalid"
            );
        }
        return !errorMessage;
    }

    // console.log(options.rules);

    // Xử lý blur vào input
    if (formElement) {
        // Xử lý submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            let isFormValid = true;

            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                if (typeof options.onSubmit === "function") {
                    let enableInputs = formElement.querySelectorAll("[name]");
                    let formValues = Array.from(enableInputs).reduce(function (
                        values
                    ) {
                        return values;
                    },
                    {});

                    options.onSubmit({
                        formValues,
                    });
                } else {
                    formElement.submit();
                }
            }
        };

        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur)
        options.rules.forEach(function (rule) {
            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            let inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                // Xử lý blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                };

                inputElement.oninput = function () {
                    let errorElement = getParent(
                        inputElement,
                        options.formGroupSelector
                    ).querySelector(options.errorSelector);
                    errorElement.textContent = "";
                    getParent(
                        inputElement,
                        options.formGroupSelector
                    ).classList.remove("invalid");
                };
            }
        });
    }

    // Disable nút submit nếu có lỗi
}

// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => Trả ra message lỗi
// 2. Khi hợp lệ => Không trả ra gì cả (undefined)

// Tên: chữ hoa chữ thường, không có kí tự đặc biệt, có thể tiếng Việt
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim()
                ? undefined
                : message || "Vui lòng nhập trường này";
        },
    };
};

Validator.isName = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            const regex = /^[a-zA-ZÀ-ỹ\s]+$/;
            return regex.test(value)
                ? undefined
                : message ||
                      "Vui lòng điền đúng định dạng(chữ hoa, chữ thường và không chứa kí tự đặc biệt)";
        },
    };
};

// đúng định dạng email
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value)
                ? undefined
                : message || "Trường này phải là email";
        },
    };
};

// Mật khẩu: 8-32 kí tự, ít nhất 1 chữ hoa và 1 chữ thường
Validator.isCorrectPassword = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/;
            return value.length >= 8 && value.length <= 32
                ? regex.test(value)
                    ? undefined
                    : "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số"
                : "Mật khẩu tối thiểu 8 kí tự và tối đa 32 kí tự";
        },
    };
};

// cconfirm password
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue()
                ? undefined
                : message || "Mật khẩu nhập lại không chính xác";
        },
    };
};
