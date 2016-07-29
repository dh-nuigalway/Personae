## The New Variorum Shakespeare Digital Challenge

The MLA Committee on the New Variorum Edition of Shakespeare (NVS) is sponsoring its third digital challenge to find the most innovative and compelling uses of the data contained in one of the NVS editions. The MLA is making available the XML files and schema for two volumes, _The Winter’s Tale_ and _The Comedy of Errors_, under a [Creative Commons BY-NC 4.0 license][cc-by-nc].

A short introduction to the NVS edition and the opportunities it provides for digital forms can be found [here][intro].

The committee seeks entries featuring new means of displaying, representing, and exploring this data in the most exciting API, interface, visualization, or data-mining project. Entries may be in code, but contestants are encouraged to create wireframes that visualize the various uses of the XML files and serve as schemata for programmers. This will involve a visual and written rationale that offers rigorous scholarly and theoretical reflection.

The goal is to see the possibilities of the NVS in digital form and, in particular, the innovations in scholarly research, teaching, or acting and directing that might be enabled by opening up the NVS’s code. Projects will thus be judged both on the quality of the interface they provide for the NVS and on the insights produced by the mash-up. The committee is especially interested in entries that combine the NVS data with another Shakespearian project, such as _Folger Digital Texts_, _Internet Shakespeare Editions_, or _Open Source Shakespeare_.

The deadline for entries is 1 August 2016. The committee will assess the submissions and select the winner no later than 15 September 2016. The prize of $500 and an award certificate will be given at the 2017 MLA convention in Philadelphia.

Entries may be sent to <nvs@mla.org>. Questions about the NVS Digital Challenge should be addressed to Kathleen Fitzpatrick, director of scholarly communication, at <kfitzpatrick@mla.org>.

For more information about our partner projects, please contact Michael Best (<mbest1@uvic.ca>), of _Internet Shakespeare Editions_, or Eric Johnson (<eric.johnson@folger.edu>), of _Open Source Shakespeare_ and _Folger Digital Texts_.

Please note that our partners are available to answer questions about the resources, not to provide technical support.

### The First Two Rounds

In the 2012 digital challenge, the MLA released the XML files and schema for _The Comedy of Errors_ under a [Creative Commons BY-NC 3.0 license][cc-by-nc]. The winner of the challenge was Patrick Murray-John’s _Bill-Crit-O-Matic_. For more information about the development of _Bill-Crit-O-Matic_, please visit [Murray-John’s blog post][bill-crit]. The runner-up was Doug Reside and Gregory Lord’s _Comedy of Errors_ (<http://comedyoferrors.zengrove.com>). No award was given in the 2014 challenge.

### A Note on Data Design and TEI Conformance

The MLA is making a preliminary version of the source XML data for its NVS editions publicly available for research and experimentation. Some explanation of the motives guiding the design of the data and of the data’s status as an intellectual product may be helpful to those who wish to use the data.

First, the version of the data currently being shared is designed primarily for internal use as part of the production process for the NVS print volumes. It is offered as is, for experimentation. It is not intended as a model of good practice in the use of TEI. The current version of the data is not in the TEI namespace but in an NVS namespace. This is a practical measure to simplify certain aspects of the production process. A future release of the data, intended for public use, will use the TEI namespace (with NVS-specific elements in the NVS namespace).

A second point of relevance for potential users is the question of TEI conformance. As those familiar with the TEI will know, TEI conformance is a strictly defined concept; conformant data must be valid against a strict subset of the TEI schema, featuring no new elements or structural changes. The TEI also defines two other categories of data: TEI-conformable data (which can be converted to TEI conformance automatically without information loss) and TEI extensions (which use the TEI but make more substantial structural changes and additions to the tagset). (For full details, please see chapter 23 of the TEI guidelines: <http://www.tei-c.org/release/doc/tei-p5-doc/en/html/USE.html>.) For the NVS, TEI conformance is not possible because of the substantial number of structural adaptations necessary to accommodate NVS-specific features. Some of these may be of value to other edition projects and will be shared in the future with the TEI community as feature requests, but others are simply artifacts of the NVS editions and production process and are not candidates for inclusion in the TEI proper. As a result, the NVS data set taken as a whole can be expressed as a TEI extension but not as TEI conformant or TEI conformable, since it cannot be converted to a conformant format without loss of information.

However, it is important to note that the data can be converted to TEI conformance by eliminating NVS-specific features through a fairly straightforward process using a tool like XSLT. The accompanying documentation describes the function of all NVS-specific elements, which may be helpful in deciding on the closest TEI equivalent (or in determining whether the element and its content could be jettisoned altogether).

Finally, the MLA may in the future create versions of the data that are specifically intended to support an electronic NVS edition, and those versions may better lend themselves to expression as TEI conformant or conformable data (since they will not have to support the print-specific features of the edition).

### License

This work is licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License][cc-by-nc].

![Creative Commons License](http://i.creativecommons.org/l/by-nc/4.0/88x31.png)

[cc-by-nc]: http://creativecommons.org/licenses/by-nc/4.0/
[intro]: https://nvs.commons.mla.org/2015/09/24/short-intro-to-nvs/
[bill-crit]: http://hackingthehumanities.org/post/s-hack-speare-or-building-bill-crit-o-matic
