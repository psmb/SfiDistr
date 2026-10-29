<?php

use enshrined\svgSanitize\Sanitizer;
use PHPUnit\Framework\TestCase;

final class SvgSanitizerTest extends TestCase
{
    public function testDtdEntitiesCannotPreserveJavascriptLinks(): void
    {
        // GHSA-9rjx-3jch-6vjf: XML and HTML resolve the same entity differently.
        $svg = <<<'SVG'
<!DOCTYPE svg [<!ENTITY Tab "#">]>
<svg xmlns="http://www.w3.org/2000/svg">
    <a href="&Tab;javascript:alert(1)"><rect width="10" height="10"/></a>
</svg>
SVG;

        $clean = (new Sanitizer())->sanitize($svg);
        self::assertStringNotContainsString('javascript:', (string) $clean);
    }

    public function testBenignSvgIsPreserved(): void
    {
        $clean = (new Sanitizer())->sanitize('<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>');
        self::assertNotFalse($clean);
        self::assertStringContainsString('<rect', $clean);
    }
}
