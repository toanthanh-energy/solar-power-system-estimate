document.addEventListener('DOMContentLoaded', function () {
    console.log('Solar Power System Estimate loaded!');
    const inputType = document.getElementById('input-type');
    const costLabel = document.getElementById('cost-label');
    const usageLabel = document.getElementById('usage-label');
    const systemType = document.getElementById('system-type');
    const residentialFields = document.getElementById('residential-fields');
    const businessFields = document.getElementById('business-fields');
    const form = document.getElementById('estimate-form');
    const resultArea = document.getElementById('result-area');
    const roofAreaInput = document.getElementById('roof-area');
    const reductionRateSelect = document.getElementById('reduction-rate');
    let panelTypeSelect = document.getElementById('panel-type');

    inputType.addEventListener('change', function () {
        if (inputType.value === 'electricity_cost') {
            costLabel.classList.remove('hidden');
            usageLabel.classList.add('hidden');
            setRequiredAndDisabled(electricityCostInput, true, false);
            setRequiredAndDisabled(electricityUsageInput, false, true);
        } else {
            costLabel.classList.add('hidden');
            usageLabel.classList.remove('hidden');
            setRequiredAndDisabled(electricityCostInput, false, true);
            setRequiredAndDisabled(electricityUsageInput, true, false);
        }
    });

    systemType.addEventListener('change', function () {
        if (systemType.value === 'residential') {
            residentialFields.style.display = '';
            businessFields.style.display = 'none';
        } else {
            residentialFields.style.display = 'none';
            businessFields.style.display = '';
        }
    });

    function formatNumberInput(input) {
        input.addEventListener('input', function (e) {
            let value = input.value.replace(/[^\d]/g, '');
            if (value) {
                input.value = Number(value).toLocaleString('en-US');
            } else {
                input.value = '';
            }
        });
    }

    const electricityCostInput = document.getElementById('electricity-cost');
    const electricityUsageInput = document.getElementById('electricity-usage');
    if (electricityCostInput) formatNumberInput(electricityCostInput);
    if (electricityUsageInput) formatNumberInput(electricityUsageInput);

    if (roofAreaInput && reductionRateSelect) {
        roofAreaInput.addEventListener('input', function () {
            if (reductionRateSelect.value !== '') {
                roofAreaInput.value = '';
                roofAreaInput.disabled = true;
            }
        });
        reductionRateSelect.addEventListener('change', function () {
            if (reductionRateSelect.value === '') {
                roofAreaInput.disabled = false;
            } else {
                roofAreaInput.disabled = true;
                roofAreaInput.value = '';
            }
        });
        if (reductionRateSelect.value === '') {
            roofAreaInput.disabled = false;
        } else {
            roofAreaInput.disabled = true;
            roofAreaInput.value = '';
        }
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Lấy dữ liệu từ form
        const systemTypeValue = document.getElementById('system-type').value;
        let info = '';
        let annualProduction = 0;
        let annualSaving = 0;
        let paybackYears = 0;

        if (systemTypeValue === 'residential') {
            const daytimeRate = Number(document.getElementById('daytime-usage-rate')?.value || 0);
            let reductionRate = document.getElementById('reduction-rate')?.value;
            let monthlyKwh = 0;
            let unitPrice = 2500;
            let monthlyCost = 0;
            let roofArea = Number(document.getElementById('roof-area')?.value || 0);
            let pinCount = 0;
            let installPower = 0;
            let monthlyGen = 0;
            let usedReductionRate = 0;
            // Lấy thông số tấm pin
            let panelArea = 3;
            let panelPower = 630;
            if (panelTypeSelect) {
                const [area, power] = panelTypeSelect.value.split('-');
                panelArea = Number(area);
                panelPower = Number(power);
            }
            if (document.getElementById('input-type').value === 'electricity_cost') {
                monthlyCost = Number((document.getElementById('electricity-cost').value || '0').replace(/[^\d]/g, ''));
                if (monthlyCost < 2000000) {
                    alert('Tiền điện không được nhập dưới 2,000,000 VND!');
                    document.getElementById('electricity-cost').focus();
                    return;
                }
                // Giảm 8% thuế VAT
                monthlyCost = monthlyCost / 1.08;
                // Xác định đơn giá theo mốc
                if (monthlyCost >= 10000000) unitPrice = 3700;
                else if (monthlyCost >= 9000000) unitPrice = 3670;
                else if (monthlyCost >= 8000000) unitPrice = 3640;
                else if (monthlyCost >= 7000000) unitPrice = 3600;
                else if (monthlyCost >= 6000000) unitPrice = 3540;
                else if (monthlyCost >= 5000000) unitPrice = 3460;
                else if (monthlyCost >= 4000000) unitPrice = 3360;
                else if (monthlyCost >= 3000000) unitPrice = 3200;
                else if (monthlyCost >= 2000000) unitPrice = 2950;
                // Tính số kWh
                monthlyKwh = monthlyCost / unitPrice;
            } else {
                monthlyKwh = Number((document.getElementById('electricity-usage').value || '0').replace(/[^\d]/g, ''));
            }
            // Nếu chọn tối ưu theo diện tích mái
            if (reductionRate === '') {
                // Tính số tấm pin
                pinCount = Math.ceil(roofArea / panelArea);
                console.log(pinCount);
                console.log(roofArea);
                installPower = pinCount * (panelPower / 1000); // kWp
                let dailyGen = installPower * 4 * 0.8; // kWh/ngày
                monthlyGen = dailyGen * 30; // kWh/tháng
                console.log(monthlyGen);
                console.log(monthlyKwh);
                if (monthlyGen > monthlyKwh) {
                    usedReductionRate = 90;
                } else {
                    usedReductionRate = Math.floor((monthlyGen / monthlyKwh) * 100);
                    console.log(usedReductionRate);
                }
                reductionRate = usedReductionRate;
            } else {
                reductionRate = Number(reductionRate);
            }
            // Xác định loại hệ thống
            let systemType = 'Hybrid';
            if (((reductionRate >= 50 && reductionRate < 60) && (daytimeRate === 80 || daytimeRate === 90)) || 
                ((reductionRate >= 60 && reductionRate < 70) && daytimeRate === 90) 
            ) {
                systemType = 'On-grid';
            }
            // Tính toán 
            const targetKwh = monthlyKwh * (reductionRate / 100);
            console.log("targetKwh: " + targetKwh);
            // Tính toán hệ thống
            let systemSizeKwp = targetKwh / (30 * 4 * 0.8);
            console.log("systemSizeKwp: " + systemSizeKwp);
            // Tính toán số tấm pin
            pinCount = Math.ceil(systemSizeKwp / (panelPower / 1000));
            // Tính toán công suất lắp đặt
            systemSizeKwp = pinCount * (panelPower / 1000);
            const installArea = pinCount * panelArea;
            let storageKwh = 0;
            if (systemType === 'Hybrid') {
                // Tính toán lưu trữ 
                storageKwh = (targetKwh / 30) * (1 - daytimeRate / 100) / 0.85;
            } 
            annualProduction = targetKwh * 12;
            annualSaving = annualProduction * unitPrice; // VND
            // Chi phí đầu tư 8,5 triệu/1kWp
            let investment = systemSizeKwp * 8500000;
            if (systemType === 'Hybrid') {
                // Tính toán lưu trữ thêm
                investment += storageKwh * 6000000;
            }
            paybackYears = investment / annualSaving;
            let extraInfo = '';
            if (document.getElementById('reduction-rate')?.value === '') {
                extraInfo = `<br>- Số tấm pin có thể lắp: ${pinCount} tấm` +
                    `<br>- Công suất lắp đặt: ${installPower.toFixed(2)} kWp - Lưu trữ ${storageKwh.toFixed(2)} kWh` +
                    `<br>- Sản lượng điện tạo ra/tháng: ${monthlyGen.toLocaleString()} kWh` +
                    `<br>- Diện tích lắp đặt: ${installArea.toFixed(2)} m²` +
                    `<br>- % điện muốn giảm (tối ưu): ${usedReductionRate}%`;
            }
            info = `Hệ thống có thông số sau: 
            <br>- Loại hệ thống: ${systemType}
            <br>- Đơn giá điện: ${unitPrice.toLocaleString()} VND/kWh
            <br>- Tỷ lệ dùng điện ban ngày: ${daytimeRate}%
            <br>- % điện muốn giảm: ${reductionRate}%
            <br>- Công suất hệ thống (ước tính): ${systemSizeKwp.toFixed(2)} kWp - Lưu trữ ${storageKwh.toFixed(2)} kWh
            <br>- Chi phí đầu tư (ước tính): ${Math.ceil(investment).toLocaleString()} VND${extraInfo}`;
        } else {
            // ... có thể bổ sung cho business nếu cần ...
            info = 'Chức năng này hiện chỉ hỗ trợ hệ dân dụng.';
        }
        resultArea.innerHTML = `
            <strong>Kết quả ước tính:</strong><br><br>
            ${info}<br><br>
            <b>Số lượng điện tạo ra theo năm:</b> ${Math.ceil(annualProduction).toLocaleString()} kWh<br>
            <b>Số tiền tiết kiệm theo năm:</b> ${Math.ceil(annualSaving).toLocaleString()} VND<br>
            <b>Số năm hoàn vốn:</b> ${paybackYears ? paybackYears.toFixed(1) : '-'} năm
        `;
        resultArea.classList.add('active');
    });

    // Khởi tạo trạng thái đúng khi load trang
    if (inputType.value === 'electricity_cost') {
        costLabel.classList.remove('hidden');
        usageLabel.classList.add('hidden');
        setRequiredAndDisabled(electricityCostInput, true, false);
        setRequiredAndDisabled(electricityUsageInput, false, true);
    } else {
        costLabel.classList.add('hidden');
        usageLabel.classList.remove('hidden');
        setRequiredAndDisabled(electricityCostInput, false, true);
        setRequiredAndDisabled(electricityUsageInput, true, false);
    }
});

function setRequiredAndDisabled(input, required, disabled) {
    if (!input) return;
    input.required = required;
    input.disabled = disabled;
} 