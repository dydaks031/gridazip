$(function () {
    var $priceSheetSection = $('.designer-price-sheet');
    var tableColumns = $priceSheetSection.find('table tr td');
    tableColumns.hover(
        function () {
            var $this = $(this);
            var index = $this.index() - 1;
            $priceSheetSection.find('table tr').each(function () {
                var $this = $(this);
                $this.find('td:eq(' + index + ')').addClass('active').siblings('.active').removeClass('active');
            });
        },
        function () {
            var $this = $(this);
            var index = $this.index() - 1;
            $priceSheetSection.find('table td.active').removeClass('active');
        }
    );
});