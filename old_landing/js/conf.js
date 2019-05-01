LaPa.CONF = {
    'loader': false,
    'parseLinks': true,
    'pageInit': function () {
        VK.Widgets.CommunityMessages("vk_community_messages", 117879245, {
            onCanNotWrite: function () {
                VK.Widgets.CommunityMessages.destroy("vk_community_messages");
            }
        });
        document.getElementById('vk_community_messages').onmouseover = function () {
            this.style.opacity = 1;
        };
        document.getElementById('vk_community_messages').onmouseout = function () {
            if (this.style.width == '60px') this.style.opacity = 0.3;
        }
    }
};