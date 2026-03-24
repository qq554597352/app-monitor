"""
中国母公司数据库
覆盖各国头部信贷/金融APP与其中国资本关联方
数据来源：公开报道、企业披露、投资信息
"""

# 格式：
# "包名" or "APP名关键词(小写)" → { "chinese_parent": "母公司名", "relation": "关系描述" }
#
# 匹配优先级：精确包名 > APP名模糊匹配

PACKAGE_TO_PARENT: dict[str, dict] = {
    # ========== 菲律宾 ==========
    "com.fuse.lending": {
        "chinese_parent": "Fuse Lending（国际资本支持）",
        "relation": "外资持股",
        "country": "PH",
    },
    "com.cashalo.app": {
        "chinese_parent": "Oriente（关联腾讯/洪泰基金）",
        "relation": "投资方",
        "country": "PH",
    },
    "com.easycash": {
        "chinese_parent": "Finvasia Group",
        "relation": "外资持股",
        "country": "PH",
    },
    "ph.gcash.android": {
        "chinese_parent": "Ant Group（蚂蚁集团间接持股）",
        "relation": "股东",
        "country": "PH",
    },
    "com.mynt.gcash": {
        "chinese_parent": "Ant Group（蚂蚁集团间接持股）",
        "relation": "股东",
        "country": "PH",
    },
    "com.dragonpay.gcash": {
        "chinese_parent": "Ant Group（蚂蚁集团间接持股）",
        "relation": "股东",
        "country": "PH",
    },
    "com.unacash.app": {
        "chinese_parent": "UNO Digital Bank（中国城商行参股）",
        "relation": "投资方",
        "country": "PH",
    },
    "com.juanhand.loanapp": {
        "chinese_parent": "信也科技（FINV）",
        "relation": "母公司",
        "country": "PH",
    },
    "com.juanhandloan": {
        "chinese_parent": "信也科技（FINV）",
        "relation": "母公司",
        "country": "PH",
    },
    "com.rob.pera": {
        "chinese_parent": "Robinsons Bank",
        "relation": "本地资本",
        "country": "PH",
    },
    "com.akulaku.credit.philippines": {
        "chinese_parent": "蚂蚁集团 / Akulaku Group（中资）",
        "relation": "母公司",
        "country": "PH",
    },
    "com.tala.android.scarecrow": {
        "chinese_parent": "Tala（美资，PayJoy投资）",
        "relation": "外资",
        "country": "PH",
    },
    # ========== 印尼 ==========
    "com.adakami.app": {
        "chinese_parent": "信也科技（FINV）旗下PT AdaKami",
        "relation": "全资子公司",
        "country": "ID",
    },
    "id.finmas.main": {
        "chinese_parent": "陆金所 / 平安集团（FinmasFintech）",
        "relation": "股东",
        "country": "ID",
    },
    "com.akulaku.credit": {
        "chinese_parent": "Akulaku（蚂蚁集团战略投资）",
        "relation": "战略投资方",
        "country": "ID",
    },
    "com.danacepat": {
        "chinese_parent": "元生资本 / IDG资本（Dana Cepat）",
        "relation": "投资方",
        "country": "ID",
    },
    "id.co.kredivo.app": {
        "chinese_parent": "FinAccel（新加坡，腾讯战略投资）",
        "relation": "投资方",
        "country": "ID",
    },
    "com.goto.gopay.android": {
        "chinese_parent": "阿里巴巴（持股GoTo）",
        "relation": "股东",
        "country": "ID",
    },
    "id.ovo.app": {
        "chinese_parent": "阿里巴巴（间接持股OVO via Tokopedia）",
        "relation": "间接股东",
        "country": "ID",
    },
    "com.dana.indonesia": {
        "chinese_parent": "Ant Group（蚂蚁集团持股DANA）",
        "relation": "战略股东",
        "country": "ID",
    },
    "id.co.julo.julo": {
        "chinese_parent": "Julo（IDG资本等投资）",
        "relation": "投资方",
        "country": "ID",
    },
    "com.tunaiku.app": {
        "chinese_parent": "Amar Bank（泰国UAB控股）",
        "relation": "外资",
        "country": "ID",
    },
    "id.co.investree.mobile": {
        "chinese_parent": "JTA International（泰国+中国联合持股）",
        "relation": "投资方",
        "country": "ID",
    },
    "id.co.easycash.aplikasi": {
        "chinese_parent": "信也科技（FINV）分支",
        "relation": "关联公司",
        "country": "ID",
    },
    # ========== 巴基斯坦 ==========
    "com.jazzcash.android": {
        "chinese_parent": "阿里巴巴（持股Jazz/Veon）",
        "relation": "间接股东",
        "country": "PK",
    },
    "pk.com.telenor.easypaisa": {
        "chinese_parent": "蚂蚁集团（持股Easypaisa via Telenor）",
        "relation": "股东",
        "country": "PK",
    },
    "com.hbl.android": {
        "chinese_parent": "HBL（巴基斯坦本地银行，阿迦汗基金会控股）",
        "relation": "本地资本",
        "country": "PK",
    },
    "pk.com.sadapay": {
        "chinese_parent": "SadaPay（外资初创）",
        "relation": "外资",
        "country": "PK",
    },
    "com.meezan.android": {
        "chinese_parent": "Meezan Bank（巴基斯坦本地）",
        "relation": "本地资本",
        "country": "PK",
    },
    "com.joeypay.app": {
        "chinese_parent": "JoeyPay（外资）",
        "relation": "外资",
        "country": "PK",
    },
    "com.nayapay.android": {
        "chinese_parent": "NayaPay（本地初创）",
        "relation": "本地资本",
        "country": "PK",
    },
    "pk.com.mcbbank": {
        "chinese_parent": "MCB Bank（巴基斯坦本地）",
        "relation": "本地资本",
        "country": "PK",
    },
    # ========== 马来西亚 ==========
    "com.boost.my": {
        "chinese_parent": "Axiata（马来西亚电信，与RHB合资）",
        "relation": "本地资本",
        "country": "MY",
    },
    "com.grab.personal": {
        "chinese_parent": "滴滴出行（持股Grab）",
        "relation": "股东",
        "country": "MY",
    },
    "com.touch.n.go.ewallet": {
        "chinese_parent": "Ant Group（持股TNG Digital 65%）",
        "relation": "控股股东",
        "country": "MY",
    },
    "com.gxbank.app": {
        "chinese_parent": "腾讯（持股GXBank）",
        "relation": "战略股东",
        "country": "MY",
    },
    "my.com.aeon.credit": {
        "chinese_parent": "AEON Financial（日资）",
        "relation": "外资（日本）",
        "country": "MY",
    },
    "com.maybank2u.android": {
        "chinese_parent": "Maybank（马来西亚本地最大银行）",
        "relation": "本地资本",
        "country": "MY",
    },
    "com.cimb.clicks": {
        "chinese_parent": "CIMB Group（马来西亚本地）",
        "relation": "本地资本",
        "country": "MY",
    },
    "com.pinjaman.ringgit.easy": {
        "chinese_parent": "未公开（疑似中资背景）",
        "relation": "待核实",
        "country": "MY",
    },
    # ========== 澳大利亚 ==========
    "com.beforepay.app": {
        "chinese_parent": "BeforePay（澳本地上市公司）",
        "relation": "本地资本",
        "country": "AU",
    },
    "com.mypayday.loan": {
        "chinese_parent": "未公开",
        "relation": "待核实",
        "country": "AU",
    },
    "com.moneyplace.android": {
        "chinese_parent": "MoneyPlace（澳本地P2P）",
        "relation": "本地资本",
        "country": "AU",
    },
    "au.com.commbank.commbank": {
        "chinese_parent": "CBA（澳大利亚联邦银行，本地国有）",
        "relation": "本地资本",
        "country": "AU",
    },
    "com.anz.android": {
        "chinese_parent": "ANZ Bank（澳本地）",
        "relation": "本地资本",
        "country": "AU",
    },
    "com.wisr.app": {
        "chinese_parent": "Wisr（澳本地金融科技）",
        "relation": "本地资本",
        "country": "AU",
    },
    "com.zipmoney.android": {
        "chinese_parent": "Zip Co（澳本地BNPL，ANT参股）",
        "relation": "少数股东",
        "country": "AU",
    },
    "com.afterpay.android": {
        "chinese_parent": "Block Inc（原Square，美资）",
        "relation": "外资（美国）",
        "country": "AU",
    },
    # ========== 英国 ==========
    "com.revolut.revolut": {
        "chinese_parent": "Revolut（英本地，腾讯/SoftBank投资）",
        "relation": "投资方",
        "country": "GB",
    },
    "com.monzo.android": {
        "chinese_parent": "Monzo（英本地，腾讯战略投资）",
        "relation": "投资方",
        "country": "GB",
    },
    "com.starlingbank": {
        "chinese_parent": "Starling Bank（英本地数字银行）",
        "relation": "本地资本",
        "country": "GB",
    },
    "com.oaknorth.android": {
        "chinese_parent": "OakNorth（英本地，SoftBank参股）",
        "relation": "外资（日本SoftBank）",
        "country": "GB",
    },
    "uk.co.fairquid.android": {
        "chinese_parent": "Fairquid（英本地工资贷款）",
        "relation": "本地资本",
        "country": "GB",
    },
    "com.creditspring.android": {
        "chinese_parent": "CreditSpring（英本地订阅制贷款）",
        "relation": "本地资本",
        "country": "GB",
    },
    "com.kreditbee.android": {
        "chinese_parent": "KreditBee（印度，Facebook/Advent等投资）",
        "relation": "外资（印度）",
        "country": "GB",
    },
    "com.bink.android": {
        "chinese_parent": "Bink（英本地忠诚度金融）",
        "relation": "本地资本",
        "country": "GB",
    },
}

# APP名称关键词模糊匹配（包名匹配失败时使用）
# key 为小写关键词片段，匹配规则：包含该关键词则命中
NAME_KEYWORD_TO_PARENT: list[tuple[str, dict]] = [
    # 菲律宾
    ("gcash", {"chinese_parent": "Ant Group（蚂蚁集团间接持股）", "relation": "股东"}),
    ("juanhand", {"chinese_parent": "信也科技（FINV）", "relation": "母公司"}),
    ("cashalo", {"chinese_parent": "Oriente（腾讯/洪泰基金关联）", "relation": "投资方"}),
    ("easycash", {"chinese_parent": "Finvasia/信也科技关联", "relation": "关联公司"}),
    ("akulaku", {"chinese_parent": "Akulaku（蚂蚁集团战略投资）", "relation": "战略投资"}),
    # 印尼
    ("adakami", {"chinese_parent": "信也科技（FINV）", "relation": "全资子公司"}),
    ("kredit pintar", {"chinese_parent": "ADVANCE.AI（新加坡，腾讯参股）", "relation": "投资方"}),
    ("kredivo", {"chinese_parent": "FinAccel（腾讯战略投资）", "relation": "投资方"}),
    ("gopay", {"chinese_parent": "阿里巴巴（持股GoTo集团）", "relation": "股东"}),
    ("dana", {"chinese_parent": "Ant Group（蚂蚁集团）", "relation": "战略股东"}),
    ("ovo", {"chinese_parent": "阿里巴巴（间接持股）", "relation": "间接股东"}),
    ("amar", {"chinese_parent": "Amar Bank（泰国UAB）", "relation": "外资"}),
    ("investree", {"chinese_parent": "JTA International（泰国+中资）", "relation": "投资方"}),
    ("finmas", {"chinese_parent": "陆金所 / 平安集团", "relation": "股东"}),
    ("julo", {"chinese_parent": "IDG资本等", "relation": "投资方"}),
    # 巴基斯坦
    ("jazz cash", {"chinese_parent": "阿里巴巴（间接持股）", "relation": "间接股东"}),
    ("jazzcash", {"chinese_parent": "阿里巴巴（间接持股）", "relation": "间接股东"}),
    ("easypaisa", {"chinese_parent": "蚂蚁集团（持股Easypaisa）", "relation": "股东"}),
    # 马来西亚
    ("touch 'n go", {"chinese_parent": "Ant Group（持股65%）", "relation": "控股股东"}),
    ("touchngo", {"chinese_parent": "Ant Group（持股65%）", "relation": "控股股东"}),
    ("gxbank", {"chinese_parent": "腾讯", "relation": "战略股东"}),
    ("grabpay", {"chinese_parent": "滴滴出行（持股Grab）", "relation": "股东"}),
    # 英国/澳大利亚
    ("revolut", {"chinese_parent": "腾讯/SoftBank参股", "relation": "投资方"}),
    ("monzo", {"chinese_parent": "腾讯战略投资", "relation": "投资方"}),
    ("zip", {"chinese_parent": "ANT参股Zip Co", "relation": "少数股东"}),
    ("afterpay", {"chinese_parent": "Block Inc（美资）", "relation": "外资（美国）"}),
]


def lookup_parent(package_name: str, app_name: str) -> dict:
    """
    查找APP对应的中国母公司信息
    
    Args:
        package_name: Google Play包名 或 App Store app ID
        app_name: APP名称
    
    Returns:
        {"chinese_parent": str, "relation": str} 或 {"chinese_parent": "", "relation": ""}
    """
    # 1. 精确包名匹配
    pkg_lower = package_name.lower()
    if pkg_lower in PACKAGE_TO_PARENT:
        d = PACKAGE_TO_PARENT[pkg_lower]
        return {"chinese_parent": d["chinese_parent"], "relation": d["relation"]}

    # 2. APP名称关键词模糊匹配
    name_lower = app_name.lower()
    for keyword, info in NAME_KEYWORD_TO_PARENT:
        if keyword in name_lower:
            return {"chinese_parent": info["chinese_parent"], "relation": info["relation"]}

    return {"chinese_parent": "", "relation": ""}
